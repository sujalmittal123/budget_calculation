const express = require('express');
const { body } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const logger = require('../utils/logger');

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
);

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google', (req, res) => {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=profile email&access_type=offline&prompt=consent`;
  
  res.redirect(googleAuthUrl);
});

// @route   GET /api/auth/google/callback
// @desc    Handle Google OAuth callback
// @access  Public
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, email_verified } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        image: picture,
        emailVerified: email_verified ? new Date() : null,
      });
    } else {
      // Update user info
      user.name = name;
      user.image = picture;
      user.emailVerified = email_verified ? new Date() : null;
      await user.save();
    }

    // Create session
    req.session.userId = user._id.toString();
    
    logger.info('Session created for user', {
      userId: user._id.toString(),
      email: user.email,
      sessionID: req.sessionID
    });
    
    // Save session and redirect to callback page
    req.session.save((err) => {
      if (err) {
        logger.error('Session save error', err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=session_failed`);
      }
      logger.debug('Session saved successfully', { sessionID: req.sessionID });
      
      // CRITICAL FIX: Pass session ID in URL as fallback for cross-domain cookie issues
      // The cookie is still set (for same-domain requests), but we also pass the session ID
      // in the URL so the frontend can send it back in a custom header
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Redirecting...</title>
            <meta charset="utf-8">
          </head>
          <body>
            <script>
              // Redirect with session ID in URL (fallback for cookie issues)
              setTimeout(function() {
                window.location.href = "${process.env.FRONTEND_URL}/auth/callback?success=true&sid=${req.sessionID}";
              }, 100);
            </script>
            <p>Authentication successful! Redirecting...</p>
          </body>
        </html>
      `);
    });

  } catch (error) {
    logger.error('Google OAuth error', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
});

// @route   POST /api/auth/google (for credential-based login)
// @desc    Google OAuth login with credential
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'No credential provided'
      });
    }

    // Verify the credential
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, email_verified } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        image: picture,
        emailVerified: email_verified ? new Date() : null,
      });
    } else {
      user.name = name;
      user.image = picture;
      user.emailVerified = email_verified ? new Date() : null;
      await user.save();
    }

    // Create session
    req.session.userId = user._id.toString();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        preferences: user.preferences,
        monthlyBudgetLimit: user.monthlyBudgetLimit
      }
    });

  } catch (error) {
    logger.error('Google credential verification error', error);
    res.status(401).json({
      success: false,
      message: 'Invalid Google credential'
    });
  }
});

// @route   GET /api/auth/session
// @desc    Get current session
// @access  Public
router.get('/session', async (req, res) => {
  try {
    // Check for session ID in custom header (fallback for cross-domain cookie issues)
    const customSessionId = req.headers['x-session-id'];
    
    logger.debug('Session check', {
      hasSession: !!req.session,
      hasUserId: !!req.session?.userId,
      customSessionId: customSessionId || 'none'
    });
    
    // If custom session ID is provided, try to load that session
    if (customSessionId && (!req.session || !req.session.userId)) {
      // This is a workaround for cross-domain cookie issues
      // We'll manually load the session from the store
      const sessionStore = req.sessionStore;
      
      return new Promise((resolve, reject) => {
        sessionStore.get(customSessionId, (err, session) => {
          if (err || !session || !session.userId) {
            logger.debug('Custom session not found', { customSessionId });
            return res.json({
              success: true,
              data: { user: null }
            });
          }
          
          logger.debug('Found session via custom header', { customSessionId });
          
          // Load user from session
          User.findById(session.userId)
            .then(user => {
              if (!user) {
                logger.debug('User not found in database');
                return res.json({
                  success: true,
                  data: { user: null }
                });
              }
              
              logger.debug('Session valid via custom header', { email: user.email });
              
              res.json({
                success: true,
                data: {
                  user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    emailVerified: user.emailVerified,
                    preferences: user.preferences,
                    monthlyBudgetLimit: user.monthlyBudgetLimit
                  }
                }
              });
            })
            .catch(err => {
              logger.error('Error loading user', err);
              res.json({
                success: true,
                data: { user: null }
              });
            });
        });
      });
    }
    
    // Normal cookie-based session check
    if (!req.session || !req.session.userId) {
      logger.debug('No session found');
      return res.json({
        success: true,
        data: { user: null }
      });
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      logger.warn('User not found in database, destroying session');
      req.session.destroy();
      return res.json({
        success: true,
        data: { user: null }
      });
    }

    logger.debug('Session valid', { email: user.email });
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified,
          preferences: user.preferences,
          monthlyBudgetLimit: user.monthlyBudgetLimit
        }
      }
    });

  } catch (error) {
    logger.error('Session fetch error', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching session'
    });
  }
});

// @route   POST /api/auth/signout
// @desc    Sign out user
// @access  Public
router.post('/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error signing out'
      });
    }
    res.json({
      success: true,
      message: 'Signed out successfully'
    });
  });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        preferences: user.preferences,
        monthlyBudgetLimit: user.monthlyBudgetLimit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('monthlyBudgetLimit').optional().isNumeric().withMessage('Monthly budget limit must be a number')
], validate, async (req, res) => {
  try {
    const { name, monthlyBudgetLimit, preferences } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (monthlyBudgetLimit !== undefined) updateData.monthlyBudgetLimit = monthlyBudgetLimit;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        preferences: user.preferences,
        monthlyBudgetLimit: user.monthlyBudgetLimit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

module.exports = router;
