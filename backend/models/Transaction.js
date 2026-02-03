const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
    enum: ['personal', 'business'],
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
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'other'],
    default: 'card'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Please provide transaction date'],
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPeriod: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', null],
    default: null
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

// Index for faster queries
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, category: 1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ bankId: 1 });

// Update the updatedAt field before saving
TransactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update bank balance after transaction is saved
TransactionSchema.post('save', async function() {
  await this.constructor.updateBankBalance(this.bankId);
});

// Update bank balance after transaction is removed
TransactionSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.constructor.updateBankBalance(doc.bankId);
  }
});

// Static method to recalculate bank balance
TransactionSchema.statics.updateBankBalance = async function(bankId) {
  const BankAccount = require('./BankAccount');
  
  const result = await this.aggregate([
    { $match: { bankId: bankId } },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
          }
        },
        totalExpense: {
          $sum: {
            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
          }
        }
      }
    }
  ]);

  const bankAccount = await BankAccount.findById(bankId);
  if (bankAccount) {
    const totals = result[0] || { totalIncome: 0, totalExpense: 0 };
    bankAccount.balance = bankAccount.initialBalance + totals.totalIncome - totals.totalExpense;
    await bankAccount.save();
  }
};

module.exports = mongoose.model('Transaction', TransactionSchema);
