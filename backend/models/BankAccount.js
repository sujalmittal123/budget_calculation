const mongoose = require('mongoose');

const BankAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bankName: {
    type: String,
    required: [true, 'Please provide bank name'],
    trim: true,
    maxlength: [100, 'Bank name cannot be more than 100 characters']
  },
  accountNumber: {
    type: String,
    required: [true, 'Please provide account number'],
    trim: true
  },
  accountType: {
    type: String,
    enum: ['savings', 'checking', 'credit', 'business'],
    default: 'savings'
  },
  balance: {
    type: Number,
    default: 0
  },
  initialBalance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  isActive: {
    type: Boolean,
    default: true
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

// Mask account number for display
BankAccountSchema.methods.getMaskedAccountNumber = function() {
  const accountNum = this.accountNumber;
  if (accountNum.length <= 4) return accountNum;
  return '*'.repeat(accountNum.length - 4) + accountNum.slice(-4);
};

// Virtual for masked account number
BankAccountSchema.virtual('maskedAccountNumber').get(function() {
  const accountNum = this.accountNumber;
  if (accountNum.length <= 4) return accountNum;
  return '*'.repeat(accountNum.length - 4) + accountNum.slice(-4);
});

// Ensure virtuals are included in JSON output
BankAccountSchema.set('toJSON', { virtuals: true });
BankAccountSchema.set('toObject', { virtuals: true });

// Update the updatedAt field before saving
BankAccountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BankAccount', BankAccountSchema);
