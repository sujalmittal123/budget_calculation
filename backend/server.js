require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');

// Import rate limiters
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Import routes
const bankAccountRoutes = require('./routes/bankAccounts');
const transactionRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');
const exportRoutes = require('./routes/export');
const dailyNotesRoutes = require('./routes/dailyNotes');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Initialize Better-Auth
async function initializeAuth() {
  try {
    // Connect to MongoDB first
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Dynamic import for Better-Auth (ESM module)
    const { toNodeHandler } = await import('better-auth/node');
    const { betterAuth } = await import('better-auth');
    const { mongodbAdapter } = await import('better-auth/adapters/mongodb');
    
    // Create Better-Auth instance
    const auth = betterAuth({
      baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5000',
      secret: process.env.BETTER_AUTH_SECRET,
      database: mongodbAdapter(mongoose.connection),
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      },
      session: {
        expiresIn: 60 * 60 * 24 * 30,
        updateAge: 60 * 60 * 24,
      },
      trustedOrigins: ['http://localhost:5173', 'http://localhost:3000'],
    });
    
    // Mount Better-Auth handler BEFORE express.json()
    app.all('/api/auth/*', (req, res, next) => {
      console.log('[Better-Auth] Request:', req.method, req.url);
      next();
    }, authLimiter, toNodeHandler(auth));
    console.log('✅ Better-Auth mounted');
    
    // Store auth globally for middleware to use
    global.betterAuthInstance = auth;
    
    // Body parsing middleware - AFTER Better-Auth
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // API rate limiting
    app.use('/api', apiLimiter);
    
    // Application routes
    app.use('/api/bank-accounts', bankAccountRoutes);
    app.use('/api/transactions', transactionRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/export', exportRoutes);
    app.use('/api/daily-notes', dailyNotesRoutes);
    
    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'Budget Tracker API is running' });
    });
    
    // Error handling
    app.use((err, req, res, next) => {
      console.error('❌ Error:', err.stack);
      res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
    
    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ success: false, message: 'Route not found' });
    });
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Auth: http://localhost:${PORT}/api/auth/*`);
    });
    
  } catch (err) {
    console.error('❌ Initialization error:', err);
    process.exit(1);
  }
}

initializeAuth();
