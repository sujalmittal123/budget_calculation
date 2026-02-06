import { Request, Response, NextFunction } from 'express';
import { UserModel } from '@/infrastructure/database/schemas/User.schema';

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if session has userId
    if (!req.session.userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Please sign in.',
      });
      return;
    }

    // Fetch full user from database
    const fullUser = await UserModel.findById(req.session.userId);
    
    if (!fullUser) {
      res.status(401).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: fullUser._id.toString(),
      email: fullUser.email,
      name: fullUser.name,
      image: fullUser.image || undefined,
      emailVerified: fullUser.emailVerified || null,
      monthlyBudgetLimit: fullUser.monthlyBudgetLimit || 0,
      preferences: fullUser.preferences || {
        darkMode: false,
        currency: 'INR',
        notifications: true,
      },
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please sign in again.',
    });
    return;
  }
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if session has userId
    if (req.session.userId) {
      // Fetch full user from database
      const fullUser = await UserModel.findById(req.session.userId);
      
      if (fullUser) {
        req.user = {
          id: fullUser._id.toString(),
          email: fullUser.email,
          name: fullUser.name,
          image: fullUser.image || undefined,
          emailVerified: fullUser.emailVerified || null,
          monthlyBudgetLimit: fullUser.monthlyBudgetLimit || 0,
          preferences: fullUser.preferences || {
            darkMode: false,
            currency: 'INR',
            notifications: true,
          },
        };
      }
    }
  } catch (error) {
    // Silently fail for optional auth
    console.error('[Optional Auth] Error:', error);
  }

  next();
};
