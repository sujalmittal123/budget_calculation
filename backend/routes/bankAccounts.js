const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const BankAccount = require('../models/BankAccount');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/betterAuthMiddleware');
const { validate } = require('../middleware/validate');

// All routes are protected
router.use(protect);

// @route   GET /api/bank-accounts
// @desc    Get all bank accounts for user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const bankAccounts = await BankAccount.find({ userId: req.user.id, isActive: true })
      .sort({ createdAt: -1 });

    // Add masked account numbers
    const accountsWithMasked = bankAccounts.map(account => ({
      ...account.toObject(),
      accountNumber: account.getMaskedAccountNumber()
    }));

    res.json({
      success: true,
      count: accountsWithMasked.length,
      data: accountsWithMasked
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bank accounts',
      error: error.message
    });
  }
});

// @route   GET /api/bank-accounts/:id
// @desc    Get single bank account
// @access  Private
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid bank account ID')
], validate, async (req, res) => {
  try {
    const bankAccount = await BankAccount.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...bankAccount.toObject(),
        accountNumber: bankAccount.getMaskedAccountNumber()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bank account',
      error: error.message
    });
  }
});

// @route   POST /api/bank-accounts
// @desc    Create bank account
// @access  Private
router.post('/', [
  body('bankName').trim().notEmpty().withMessage('Bank name is required'),
  body('accountNumber').trim().notEmpty().withMessage('Account number is required'),
  body('accountType').optional().isIn(['savings', 'checking', 'credit', 'business']),
  body('initialBalance').optional().isNumeric().withMessage('Initial balance must be a number'),
  body('currency').optional().trim(),
  body('color').optional().trim()
], validate, async (req, res) => {
  try {
    const { bankName, accountNumber, accountType, initialBalance, currency, color } = req.body;

    const bankAccount = await BankAccount.create({
      userId: req.user.id,
      bankName,
      accountNumber,
      accountType: accountType || 'savings',
      initialBalance: initialBalance || 0,
      balance: initialBalance || 0,
      currency: currency || 'USD',
      color: color || '#3B82F6'
    });

    res.status(201).json({
      success: true,
      data: {
        ...bankAccount.toObject(),
        accountNumber: bankAccount.getMaskedAccountNumber()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating bank account',
      error: error.message
    });
  }
});

// @route   PUT /api/bank-accounts/:id
// @desc    Update bank account
// @access  Private
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid bank account ID'),
  body('bankName').optional().trim().notEmpty().withMessage('Bank name cannot be empty'),
  body('accountType').optional().isIn(['savings', 'checking', 'credit', 'business']),
  body('color').optional().trim()
], validate, async (req, res) => {
  try {
    let bankAccount = await BankAccount.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    const { bankName, accountType, currency, color } = req.body;

    const updateData = {};
    if (bankName) updateData.bankName = bankName;
    if (accountType) updateData.accountType = accountType;
    if (currency) updateData.currency = currency;
    if (color) updateData.color = color;

    bankAccount = await BankAccount.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: {
        ...bankAccount.toObject(),
        accountNumber: bankAccount.getMaskedAccountNumber()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating bank account',
      error: error.message
    });
  }
});

// @route   DELETE /api/bank-accounts/:id
// @desc    Delete bank account (soft delete)
// @access  Private
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid bank account ID')
], validate, async (req, res) => {
  try {
    const bankAccount = await BankAccount.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // Check if there are transactions linked to this account
    const transactionCount = await Transaction.countDocuments({ bankId: req.params.id });
    
    if (transactionCount > 0) {
      // Soft delete - just mark as inactive
      bankAccount.isActive = false;
      await bankAccount.save();
      
      return res.json({
        success: true,
        message: 'Bank account deactivated (has linked transactions)'
      });
    }

    // Hard delete if no transactions
    await bankAccount.deleteOne();

    res.json({
      success: true,
      message: 'Bank account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting bank account',
      error: error.message
    });
  }
});

// @route   GET /api/bank-accounts/:id/transactions
// @desc    Get transactions for a specific bank account
// @access  Private
router.get('/:id/transactions', [
  param('id').isMongoId().withMessage('Invalid bank account ID')
], validate, async (req, res) => {
  try {
    const bankAccount = await BankAccount.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    const transactions = await Transaction.find({ bankId: req.params.id })
      .sort({ date: -1 })
      .limit(50);

    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
});

module.exports = router;
