const mongoose = require('mongoose');

/**
 * User Model - Compatible with Better-Auth
 * 
 * This model has been updated to work with Better-Auth while maintaining
 * backward compatibility with existing budget tracking features.
 * 
 * Better-Auth will automatically manage:
 * - Authentication sessions (in 'session' collection)
 * - OAuth accounts (in 'account' collection)
 * - Email verification (in 'verification' collection)
 */

const UserSchema = new mongoose.Schema({
  // Basic user information (Better-Auth compatible)
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  
  // Better-Auth fields
  emailVerified: {
    type: Date,
    default: null,
    // Google OAuth users have pre-verified emails
  },
  image: {
    type: String,
    default: null,
    // Stores Google profile picture or custom avatar
  },
  
  // Budget Tracker specific fields
  monthlyBudgetLimit: {
    type: Number,
    default: 0
  },
  preferences: {
    darkMode: {
      type: Boolean,
      default: false
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for checking if user has verified email
UserSchema.virtual('isEmailVerified').get(function() {
  return this.emailVerified !== null;
});

// Ensure virtuals are included in JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);
