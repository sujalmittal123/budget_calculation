// Better-Auth instance will be available globally after initialization
const protect = async (req, res, next) => {
  try {
    if (!global.betterAuthInstance) {
      return res.status(503).json({
        success: false,
        message: 'Authentication system is initializing. Please try again.',
      });
    }
    
    const session = await global.betterAuthInstance.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please sign in.',
      });
    }

    req.user = {
      id: session.user.id,
      _id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      emailVerified: session.user.emailVerified,
      monthlyBudgetLimit: session.user.monthlyBudgetLimit,
      preferences: session.user.preferences,
    };

    next();
  } catch (error) {
    console.error('[Better-Auth Middleware] Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please sign in again.',
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    if (!global.betterAuthInstance) {
      req.user = null;
      return next();
    }
    
    const session = await global.betterAuthInstance.api.getSession({
      headers: req.headers,
    });

    if (session && session.user) {
      req.user = {
        id: session.user.id,
        _id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        emailVerified: session.user.emailVerified,
        monthlyBudgetLimit: session.user.monthlyBudgetLimit,
        preferences: session.user.preferences,
      };
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = { protect, optionalAuth };
