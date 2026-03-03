require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require('./utils/logger');

// Import rate limiters
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Import cron jobs
const { startRecurringJob } = require('./jobs/generateRecurring');

// Import routes
const authRoutes = require('./routes/auth');
const bankAccountRoutes = require('./routes/bankAccounts');
const transactionRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');
const exportRoutes = require('./routes/export');
const dailyNotesRoutes = require('./routes/dailyNotes');
const recurringTransactionsRoutes = require('./routes/recurringTransactions');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'], // IMPORTANT: Allow custom header
  exposedHeaders: ['Set-Cookie'],
}));

// Session middleware with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reset expiration on every response
  store: MongoStore.default ? MongoStore.default.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 30 * 24 * 60 * 60, // 30 days in seconds
    autoRemove: 'native', // Let MongoDB handle TTL
    touchAfter: 24 * 3600, // Only update session once per 24 hours (unless modified)
  }) : new MongoStore({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 30 * 24 * 60 * 60,
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site auth in production
    path: '/',
  },
  name: 'budget.sid',
}));

// Debug middleware - log session info
app.use((req, res, next) => {
  if (req.path.includes('/api/') && req.path !== '/api/health') {
    logger.debug(`${req.method} ${req.path}`, {
      sessionID: req.sessionID ? 'exists' : 'none',
      userID: req.session?.userId || 'none',
    });
  }
  next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`Sanitized request data: ${key} in ${req.method} ${req.path}`);
  },
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('✅ Connected to MongoDB');
    
    // Start cron jobs after database connection
    startRecurringJob();
  })
  .catch(err => {
    logger.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// API rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Application routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authRoutes); // Profile endpoints also accessible via /user
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/daily-notes', dailyNotesRoutes);
app.use('/api/recurring', recurringTransactionsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Budget Tracker API is running' });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Status page to verify authentication
app.get('/api/auth/status', async (req, res) => {
  const customSessionId = req.headers['x-session-id'];
  
  // Check cookie-based session first
  if (req.session && req.session.userId) {
    const User = require('./models/User');
    const user = await User.findById(req.session.userId);
    return res.send(`
      <html>
        <body style="font-family: Arial; padding: 20px;">
          <h1>✅ Logged In (via Cookie)</h1>
          <p><strong>Email:</strong> ${user?.email || 'N/A'}</p>
          <p><strong>Session ID:</strong> ${req.sessionID}</p>
          <p><strong>Method:</strong> Cookie</p>
        </body>
      </html>
    `);
  }
  
  // Check custom header
  if (customSessionId) {
    const sessionStore = req.sessionStore;
    sessionStore.get(customSessionId, async (err, session) => {
      if (!err && session && session.userId) {
        const User = require('./models/User');
        const user = await User.findById(session.userId);
        return res.send(`
          <html>
            <body style="font-family: Arial; padding: 20px;">
              <h1>✅ Logged In (via Custom Header)</h1>
              <p><strong>Email:</strong> ${user?.email || 'N/A'}</p>
              <p><strong>Session ID:</strong> ${customSessionId}</p>
              <p><strong>Method:</strong> X-Session-Id Header</p>
            </body>
          </html>
        `);
      } else {
        res.send(`
          <html>
            <body style="font-family: Arial; padding: 20px;">
              <h1>❌ Not Logged In</h1>
              <p>No valid session found</p>
              <p><strong>Custom Session ID Provided:</strong> ${customSessionId}</p>
              <p><strong>Session Found:</strong> ${!err && session ? 'Yes' : 'No'}</p>
            </body>
          </html>
        `);
      }
    });
  } else {
    res.send(`
      <html>
        <body style="font-family: Arial; padding: 20px;">
          <h1>❌ Not Logged In</h1>
          <p>No session cookie or custom header found</p>
          <p><strong>Has Cookie Session:</strong> ${!!req.session}</p>
          <p><strong>Has User ID:</strong> ${!!req.session?.userId}</p>
        </body>
      </html>
    `);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📍 API: http://localhost:${PORT}/api`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
