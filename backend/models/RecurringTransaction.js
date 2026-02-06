const mongoose = require('mongoose');

/**
 * RecurringTransaction Model
 * 
 * Manages recurring transactions (subscriptions, bills, salary, etc.)
 * Supports AI-based pattern detection from historical transactions
 */

const RecurringTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Template fields (same as Transaction)
  bankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
    required: [true, 'Please select a bank account']
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Please specify transaction type']
  },
  category: {
    type: String,
    required: [true, 'Please specify category']
  },
  subcategory: {
    type: String,
    trim: true,
    default: ''
  },
  amount: {
    type: Number,
    required: [true, 'Please provide transaction amount'],
    min: [0.01, 'Amount must be at least 0.01']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'other'],
    default: 'card'
  },
  
  // Recurring schedule
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
    required: [true, 'Please specify frequency'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date'],
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null // null means no end date
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31,
    default: 1 // For monthly: which day (1-31)
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
    default: 1 // For weekly: 0=Sunday, 1=Monday, etc.
  },
  
  // Status and control
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active'
  },
  autoGenerate: {
    type: Boolean,
    default: true // Automatically create transactions on schedule
  },
  
  // AI Detection fields
  isAutoDetected: {
    type: Boolean,
    default: false // True if detected by AI, false if manually created
  },
  detectionSource: {
    type: String,
    enum: ['manual', 'pattern_detection', 'amount_matching', 'description_matching'],
    default: 'manual'
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0 // AI confidence (0-100)
  },
  sourceTransactionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }], // Original transactions used for detection
  
  // Variable amount tracking
  isVariableAmount: {
    type: Boolean,
    default: false // True for bills that vary (electricity, water, etc.)
  },
  averageAmount: {
    type: Number,
    default: 0 // Average of past amounts
  },
  minAmount: {
    type: Number,
    default: 0
  },
  maxAmount: {
    type: Number,
    default: 0
  },
  
  // Notification settings
  notifyBefore: {
    type: Number,
    default: 3 // Days before due date to notify
  },
  lastNotified: {
    type: Date,
    default: null
  },
  
  // Generation tracking
  lastGenerated: {
    type: Date,
    default: null
  },
  nextDueDate: {
    type: Date,
    required: true,
    index: true
  },
  generatedCount: {
    type: Number,
    default: 0
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
RecurringTransactionSchema.index({ userId: 1, status: 1 });
RecurringTransactionSchema.index({ userId: 1, nextDueDate: 1 });
RecurringTransactionSchema.index({ userId: 1, isAutoDetected: 1 });

// Update timestamp before saving
RecurringTransactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate next due date based on frequency
RecurringTransactionSchema.methods.calculateNextDueDate = function() {
  const current = this.nextDueDate || this.startDate;
  let next = new Date(current);
  
  switch (this.frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      // Adjust for different month lengths
      if (this.dayOfMonth) {
        next.setDate(Math.min(this.dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
      }
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  
  return next;
};

// Check if recurring transaction is due
RecurringTransactionSchema.methods.isDue = function() {
  if (this.status !== 'active') return false;
  if (this.endDate && new Date() > this.endDate) return false;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const due = new Date(this.nextDueDate);
  due.setHours(0, 0, 0, 0);
  
  return now >= due;
};

// Generate a transaction from this recurring template
RecurringTransactionSchema.methods.generateTransaction = async function() {
  const Transaction = require('./Transaction');
  
  const transaction = await Transaction.create({
    userId: this.userId,
    bankId: this.bankId,
    type: this.type,
    category: this.category,
    subcategory: this.subcategory,
    amount: this.amount,
    description: this.description,
    paymentMethod: this.paymentMethod,
    date: this.nextDueDate,
    isRecurring: true,
    recurringPeriod: this.frequency,
    tags: [...this.tags, 'auto-generated']
  });
  
  // Update recurring transaction
  this.lastGenerated = new Date();
  this.nextDueDate = this.calculateNextDueDate();
  this.generatedCount += 1;
  
  // Mark as completed if end date reached
  if (this.endDate && this.nextDueDate > this.endDate) {
    this.status = 'completed';
  }
  
  await this.save();
  
  return transaction;
};

// Static method to find all due recurring transactions
RecurringTransactionSchema.statics.findDueTransactions = async function(userId = null) {
  const query = {
    status: 'active',
    autoGenerate: true,
    nextDueDate: { $lte: new Date() }
  };
  
  if (userId) {
    query.userId = userId;
  }
  
  return this.find(query);
};

// Static method to find upcoming recurring transactions
RecurringTransactionSchema.statics.findUpcoming = async function(userId, days = 30) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.find({
    userId,
    status: 'active',
    nextDueDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ nextDueDate: 1 });
};

module.exports = mongoose.model('RecurringTransaction', RecurringTransactionSchema);
