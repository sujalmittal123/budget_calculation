const User = require('../models/User');

// Protect routes - session-based auth
const protect = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please sign in.',
      });
    }

    const user = await User.findById(req.session.userId);
    
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
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      
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
