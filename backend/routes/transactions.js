const express = require('express');
const { body, param, query } = require('express-validator');
const multer = require('multer');
const { parse } = require('csv-parse');
const fs = require('fs');
const router = express.Router();
const Transaction = require('../models/Transaction');
const BankAccount = require('../models/BankAccount');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Configure multer for CSV upload
const upload = multer({ dest: 'uploads/' });

// All routes are protected
router.use(protect);

// @route   GET /api/transactions
// @desc    Get all transactions with filters
// @access  Private
router.get('/', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      category,
      type,
      bankId,
      paymentMethod,
      search,
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const queryObj = { userId: req.user.id };

    // Date range filter
    if (startDate || endDate) {
      queryObj.date = {};
      if (startDate) queryObj.date.$gte = new Date(startDate);
      if (endDate) queryObj.date.$lte = new Date(endDate);
    }

    // Category filter
    if (category && ['personal', 'business'].includes(category)) {
      queryObj.category = category;
    }

    // Type filter
    if (type && ['income', 'expense'].includes(type)) {
      queryObj.type = type;
    }

    // Bank account filter
    if (bankId) {
      queryObj.bankId = bankId;
    }

    // Payment method filter
    if (paymentMethod) {
      queryObj.paymentMethod = paymentMethod;
    }

    // Search in description
    if (search) {
      queryObj.description = { $regex: search, $options: 'i' };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Get transactions
    const transactions = await Transaction.find(queryObj)
      .populate('bankId', 'bankName color')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Transaction.countDocuments(queryObj);

    res.json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
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

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid transaction ID')
], validate, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('bankId', 'bankName color');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
});

// @route   POST /api/transactions
// @desc    Create transaction
// @access  Private
router.post('/', [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').notEmpty().withMessage('Category is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be at least 0.01'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('paymentMethod').optional().isIn(['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'other']),
  body('description').optional().trim().isLength({ max: 500 }),
  // BankId is optional - validate only if it's a non-empty string
  body('bankId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid bank account ID')
], validate, async (req, res) => {
  try {
    console.log('[Transaction] Create request body:', JSON.stringify(req.body, null, 2));
    const { bankId, type, category, subcategory, amount, paymentMethod, description, date, tags, isRecurring, recurringPeriod } = req.body;

    // For non-cash payment methods, bankId is required
    if (paymentMethod !== 'cash' && !bankId) {
      console.log('[Transaction] ERROR: Bank required for non-cash');
      return res.status(400).json({
        success: false,
        message: 'Bank account is required for non-cash transactions'
      });
    }

    // Verify bank account if provided
    if (bankId) {
      const bankAccount = await BankAccount.findOne({
        _id: bankId,
        userId: req.user.id,
        isActive: true
      });

      if (!bankAccount) {
        return res.status(404).json({
          success: false,
          message: 'Bank account not found'
        });
      }
    }

    console.log('[Transaction] Creating transaction with data:', {
      userId: req.user.id,
      bankId: bankId || null,
      type,
      category,
      subcategory,
      amount,
      paymentMethod: paymentMethod || 'card'
    });

    const transaction = await Transaction.create({
      userId: req.user.id,
      bankId: bankId || null,
      type,
      category,
      subcategory,
      amount,
      paymentMethod: paymentMethod || 'card',
      description,
      date: date || new Date(),
      tags: tags || [],
      isRecurring: isRecurring || false,
      recurringPeriod
    });

    console.log('[Transaction] Transaction created:', transaction._id);

    // Populate bank info if exists
    if (bankId) {
      await transaction.populate('bankId', 'bankName color balance');
    }

    console.log('[Transaction] Sending success response');
    res.status(201).json({
      success: true,
      data: transaction,
      updatedBankBalance: transaction.bankId?.balance || null
    });
  } catch (error) {
    console.error('[Transaction] ERROR creating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message
    });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid transaction ID'),
  body('type').optional().isIn(['income', 'expense']),
  body('category').optional().isIn(['personal', 'business']),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('date').optional().isISO8601(),
  body('paymentMethod').optional().isIn(['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'other'])
], validate, async (req, res) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const { type, category, subcategory, amount, paymentMethod, description, date, tags } = req.body;

    // If bankId is changing, verify new bank account
    if (req.body.bankId && req.body.bankId !== transaction.bankId.toString()) {
      const bankAccount = await BankAccount.findOne({
        _id: req.body.bankId,
        userId: req.user.id,
        isActive: true
      });

      if (!bankAccount) {
        return res.status(404).json({
          success: false,
          message: 'Bank account not found'
        });
      }
    }

    const oldBankId = transaction.bankId;

    // Update transaction
    const updateData = {};
    if (type) updateData.type = type;
    if (category) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (amount) updateData.amount = amount;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (description !== undefined) updateData.description = description;
    if (date) updateData.date = date;
    if (tags) updateData.tags = tags;
    if (req.body.bankId) updateData.bankId = req.body.bankId;

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('bankId', 'bankName color balance');

    // Update bank balances
    await Transaction.updateBankBalance(transaction.bankId._id);
    if (req.body.bankId && oldBankId.toString() !== req.body.bankId) {
      await Transaction.updateBankBalance(oldBankId);
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      error: error.message
    });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid transaction ID')
], validate, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting transaction',
      error: error.message
    });
  }
});

// @route   POST /api/transactions/import-csv
// @desc    Import transactions from CSV
// @access  Private
router.post('/import-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file'
      });
    }

    const { bankId } = req.body;

    // Verify bank account
    const bankAccount = await BankAccount.findOne({
      _id: bankId,
      userId: req.user.id,
      isActive: true
    });

    if (!bankAccount) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    const transactions = [];
    const errors = [];

    // Parse CSV
    const parser = fs.createReadStream(req.file.path).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      })
    );

    for await (const row of parser) {
      try {
        // Expected columns: date, type, category, amount, description, paymentMethod
        const transactionData = {
          userId: req.user.id,
          bankId,
          date: new Date(row.date || row.Date || Date.now()),
          type: (row.type || row.Type || 'expense').toLowerCase(),
          category: (row.category || row.Category || 'personal').toLowerCase(),
          amount: parseFloat(row.amount || row.Amount || 0),
          description: row.description || row.Description || '',
          paymentMethod: (row.paymentMethod || row.payment_method || 'card').toLowerCase()
        };

        // Validate
        if (transactionData.amount > 0 && 
            ['income', 'expense'].includes(transactionData.type) &&
            ['personal', 'business'].includes(transactionData.category)) {
          transactions.push(transactionData);
        } else {
          errors.push({ row, reason: 'Invalid data' });
        }
      } catch (err) {
        errors.push({ row, reason: err.message });
      }
    }

    // Delete uploaded file
    fs.unlinkSync(req.file.path);

    // Insert transactions
    if (transactions.length > 0) {
      await Transaction.insertMany(transactions);
      await Transaction.updateBankBalance(bankId);
    }

    res.json({
      success: true,
      message: `Imported ${transactions.length} transactions`,
      imported: transactions.length,
      errors: errors.length,
      errorDetails: errors.slice(0, 10) // Return first 10 errors
    });
  } catch (error) {
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Error importing CSV',
      error: error.message
    });
  }
});

// @route   DELETE /api/transactions/bulk
// @desc    Delete multiple transactions
// @access  Private
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide transaction IDs'
      });
    }

    // Get affected bank accounts
    const transactions = await Transaction.find({
      _id: { $in: ids },
      userId: req.user.id
    });

    const bankIds = [...new Set(transactions.map(t => t.bankId.toString()))];

    // Delete transactions
    const result = await Transaction.deleteMany({
      _id: { $in: ids },
      userId: req.user.id
    });

    // Update bank balances
    for (const bankId of bankIds) {
      await Transaction.updateBankBalance(bankId);
    }

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} transactions`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting transactions',
      error: error.message
    });
  }
});

module.exports = router;
