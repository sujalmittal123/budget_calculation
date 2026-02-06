import { Request, Response, NextFunction } from 'express';
import { googleOAuth } from '@/infrastructure/auth/google-oauth';
import { UserRepository } from '@/infrastructure/repositories/UserRepository';
import { env } from '@config/env';

export class AuthController {
  constructor(private userRepository: UserRepository) {}

  /**
   * Initiate Google OAuth flow
   */
  googleSignIn = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const authUrl = googleOAuth.getAuthorizationUrl();
      res.redirect(authUrl);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handle Google OAuth callback
   */
  googleCallback = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      console.log('[OAuth Callback] Starting callback handler');
      const { code, error: oauthError } = req.query;

      // Check if Google sent an error
      if (oauthError) {
        console.error('[OAuth Callback] Google OAuth error:', oauthError);
        return res.redirect(`${env.FRONTEND_URL}/?error=oauth_denied`);
      }

      if (!code || typeof code !== 'string') {
        console.error('[OAuth Callback] Missing or invalid code');
        return res.redirect(`${env.FRONTEND_URL}/?error=missing_code`);
      }

      console.log('[OAuth Callback] Exchanging code for tokens');
      // Exchange code for tokens
      const tokens = await googleOAuth.getTokensFromCode(code);

      if (!tokens.id_token) {
        console.error('[OAuth Callback] No ID token received');
        return res.redirect(`${env.FRONTEND_URL}/?error=no_token`);
      }

      console.log('[OAuth Callback] Verifying ID token');
      // Verify token and get user info
      const googleUser = await googleOAuth.verifyIdToken(tokens.id_token);
      console.log('[OAuth Callback] User verified:', googleUser.email);

      // Find or create user
      let user = await this.userRepository.findByEmail(googleUser.email);

      if (!user) {
        console.log('[OAuth Callback] Creating new user');
        // Create new user
        user = await this.userRepository.create({
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.image,
          emailVerified: googleUser.emailVerified ? new Date() : null,
          monthlyBudgetLimit: 0,
          preferences: {
            darkMode: false,
            currency: 'INR',
            notifications: true,
          },
        });
        console.log('[OAuth Callback] New user created:', user.id);
      } else {
        console.log('[OAuth Callback] Updating existing user:', user.id);
        // Update existing user's info
        user = await this.userRepository.update(user.id, {
          name: googleUser.name,
          image: googleUser.image,
          emailVerified: googleUser.emailVerified ? new Date() : user.emailVerified,
        }) || user;
      }

      // Store user ID in session
      req.session.userId = user.id;
      console.log('[OAuth Callback] User ID stored in session');

      // Save session and redirect
      req.session.save((err) => {
        if (err) {
          console.error('[OAuth Callback] Session save error:', err);
          return res.redirect(`${env.FRONTEND_URL}/?error=session_error`);
        }
        console.log('[OAuth Callback] Session saved, redirecting to dashboard');
        // Redirect to dashboard on success
        res.redirect(`${env.FRONTEND_URL}/dashboard`);
      });
    } catch (error) {
      console.error('[OAuth Callback] Error:', error);
      // Always redirect to frontend with error, never return JSON
      return res.redirect(`${env.FRONTEND_URL}/?error=auth_failed`);
    }
  };

  /**
   * Get current session
   */
  getSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.json({
          success: true,
          data: null,
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Sign out
   */
  signOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return next(err);
        }

        res.clearCookie('connect.sid'); // Default session cookie name
        res.json({
          success: true,
          message: 'Signed out successfully',
        });
      });
    } catch (error) {
      next(error);
    }
  };
}
