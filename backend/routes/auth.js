const express = require('express');
const { body } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

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
    
    // Save session and redirect to callback page
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=session_failed`);
      }
      // Redirect to callback handler page
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?success=true`);
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
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
    console.error('Google credential verification error:', error);
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
    if (!req.session || !req.session.userId) {
      return res.json({
        success: true,
        data: { user: null }
      });
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      req.session.destroy();
      return res.json({
        success: true,
        data: { user: null }
      });
    }

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
    console.error('Session fetch error:', error);
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
