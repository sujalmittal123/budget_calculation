const User = require('../models/User');

// Helper function to load session from custom header
const loadSessionFromHeader = (req) => {
  return new Promise((resolve, reject) => {
    const customSessionId = req.headers['x-session-id'];
    
    if (!customSessionId) {
      return resolve(null);
    }
    
    const sessionStore = req.sessionStore;
    sessionStore.get(customSessionId, (err, session) => {
      if (err || !session || !session.userId) {
        return resolve(null);
      }
      resolve(session);
    });
  });
};

// Protect routes - session-based auth with custom header fallback
const protect = async (req, res, next) => {
  try {
    let userId = null;
    
    // First, try to get userId from cookie-based session
    if (req.session && req.session.userId) {
      userId = req.session.userId;
    } 
    // Fallback: try custom session ID header (for cross-domain cookie issues)
    else {
      const session = await loadSessionFromHeader(req);
      if (session && session.userId) {
        userId = session.userId;
      }
    }
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please sign in.',
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please sign in again.',
      });
    }

    req.user = {
      id: user._id,
      _id: user._id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      monthlyBudgetLimit: user.monthlyBudgetLimit,
      preferences: user.preferences,
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid session. Please sign in again.',
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let userId = null;
    
    // First, try to get userId from cookie-based session
    if (req.session && req.session.userId) {
      userId = req.session.userId;
    } 
    // Fallback: try custom session ID header
    else {
      const session = await loadSessionFromHeader(req);
      if (session && session.userId) {
        userId = session.userId;
      }
    }
    
    if (userId) {
      const user = await User.findById(userId);
      
      if (user) {
        req.user = {
          id: user._id,
          _id: user._id,
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
          monthlyBudgetLimit: user.monthlyBudgetLimit,
          preferences: user.preferences,
        };
      } else {
        req.user = null;
      }
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = { protect, optionalAuth };
