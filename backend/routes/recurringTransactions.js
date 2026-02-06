const express = require('express');
const router = express.Router();
const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const recurringDetector = require('../services/recurringDetector');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// GET /api/recurring - List all recurring transactions
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    const recurring = await RecurringTransaction.find(query)
      .populate('bankId')
      .sort({ nextDueDate: 1 });
    
    res.json({
      success: true,
      data: recurring,
      count: recurring.length
    });
  } catch (error) {
    console.error('Error fetching recurring transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recurring transactions',
      error: error.message
    });
  }
});

// GET /api/recurring/detect - Detect recurring patterns from transactions
router.get('/detect', async (req, res) => {
  try {
    const patterns = await recurringDetector.detectPatternsForUser(req.user.id);
    
    res.json({
      success: true,
      data: patterns,
      count: patterns.length,
      message: patterns.length > 0 
        ? `Found ${patterns.length} potential recurring transaction(s)` 
        : 'No recurring patterns detected'
    });
  } catch (error) {
    console.error('Error detecting recurring patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Error detecting recurring patterns',
      error: error.message
    });
  }
});

// POST /api/recurring/detect/approve - Approve a detected pattern (create recurring transaction)
router.post('/detect/approve', async (req, res) => {
  try {
    const { pattern } = req.body;
    
    if (!pattern) {
      return res.status(400).json({
        success: false,
        message: 'Pattern data is required'
      });
    }
    
    // Create recurring transaction from the pattern
    const recurring = await recurringDetector.createFromPattern(req.user.id, pattern);
    
    res.status(201).json({
      success: true,
      data: recurring,
      message: 'Recurring transaction created successfully'
    });
  } catch (error) {
    console.error('Error approving pattern:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating recurring transaction from pattern',
      error: error.message
    });
  }
});

// GET /api/recurring/upcoming - Get upcoming recurring transactions
router.get('/upcoming', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    
    const upcoming = await RecurringTransaction.findUpcoming(req.user.id, days);
    
    res.json({
      success: true,
      data: upcoming,
      count: upcoming.length,
      days
    });
  } catch (error) {
    console.error('Error fetching upcoming transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming transactions',
      error: error.message
    });
  }
});

// GET /api/recurring/:id - Get single recurring transaction
router.get('/:id', async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('bankId');
    
    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: recurring
    });
  } catch (error) {
    console.error('Error fetching recurring transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recurring transaction',
      error: error.message
    });
  }
});

// POST /api/recurring - Create new recurring transaction
router.post('/', async (req, res) => {
  try {
    const recurringData = {
      ...req.body,
      userId: req.user.id
    };
    
    // Validate required fields
    const requiredFields = ['type', 'category', 'amount', 'description', 'frequency', 'startDate'];
    const missingFields = requiredFields.filter(field => !recurringData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    const recurring = new RecurringTransaction(recurringData);
    
    // Calculate next due date
    recurring.nextDueDate = recurring.calculateNextDueDate();
    
    await recurring.save();
    await recurring.populate('bankId');
    
    res.status(201).json({
      success: true,
      data: recurring,
      message: 'Recurring transaction created successfully'
    });
  } catch (error) {
    console.error('Error creating recurring transaction:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating recurring transaction',
      error: error.message
    });
  }
});

// PUT /api/recurring/:id - Update recurring transaction
router.put('/:id', async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'userId') {
        recurring[key] = req.body[key];
      }
    });
    
    // Recalculate next due date if frequency or start date changed
    if (req.body.frequency || req.body.startDate) {
      recurring.nextDueDate = recurring.calculateNextDueDate();
    }
    
    await recurring.save();
    await recurring.populate('bankId');
    
    res.json({
      success: true,
      data: recurring,
      message: 'Recurring transaction updated successfully'
    });
  } catch (error) {
    console.error('Error updating recurring transaction:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating recurring transaction',
      error: error.message
    });
  }
});

// DELETE /api/recurring/:id - Delete recurring transaction
router.delete('/:id', async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Recurring transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting recurring transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting recurring transaction',
      error: error.message
    });
  }
});

// PATCH /api/recurring/:id/pause - Pause recurring transaction
router.patch('/:id/pause', async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }
    
    recurring.status = 'paused';
    await recurring.save();
    await recurring.populate('bankId');
    
    res.json({
      success: true,
      data: recurring,
      message: 'Recurring transaction paused successfully'
    });
  } catch (error) {
    console.error('Error pausing recurring transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error pausing recurring transaction',
      error: error.message
    });
  }
});

// PATCH /api/recurring/:id/resume - Resume recurring transaction
router.patch('/:id/resume', async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }
    
    recurring.status = 'active';
    await recurring.save();
    await recurring.populate('bankId');
    
    res.json({
      success: true,
      data: recurring,
      message: 'Recurring transaction resumed successfully'
    });
  } catch (error) {
    console.error('Error resuming recurring transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error resuming recurring transaction',
      error: error.message
    });
  }
});

// POST /api/recurring/:id/generate - Manually generate transaction now
router.post('/:id/generate', async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('bankId');
    
    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }
    
    // Generate the transaction
    const transaction = await recurring.generateTransaction();
    
    res.status(201).json({
      success: true,
      data: {
        recurring,
        transaction
      },
      message: 'Transaction generated successfully'
    });
  } catch (error) {
    console.error('Error generating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating transaction',
      error: error.message
    });
  }
});

// GET /api/recurring/:id/history - Get generation history
router.get('/:id/history', async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: 'Recurring transaction not found'
      });
    }
    
    // Find all transactions generated from this recurring transaction
    const transactions = await Transaction.find({
      userId: req.user.id,
      recurringTransactionId: recurring._id
    })
    .populate('bankId')
    .sort({ date: -1 });
    
    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Error fetching generation history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching generation history',
      error: error.message
    });
  }
});

// POST /api/recurring/batch/approve - Approve multiple detected patterns
router.post('/batch/approve', async (req, res) => {
  try {
    const { patterns } = req.body;
    
    if (!patterns || !Array.isArray(patterns) || patterns.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Patterns array is required'
      });
    }
    
    const created = [];
    const errors = [];
    
    for (const pattern of patterns) {
      try {
        const recurring = await recurringDetector.createFromPattern(req.user.id, pattern);
        created.push(recurring);
      } catch (error) {
        errors.push({
          pattern: pattern.description,
          error: error.message
        });
      }
    }
    
    res.status(201).json({
      success: true,
      data: created,
      count: created.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Created ${created.length} recurring transaction(s)${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    });
  } catch (error) {
    console.error('Error batch approving patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Error batch approving patterns',
      error: error.message
    });
  }
});

// DELETE /api/recurring/batch/delete - Delete multiple recurring transactions
router.delete('/batch/delete', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs array is required'
      });
    }
    
    const result = await RecurringTransaction.deleteMany({
      _id: { $in: ids },
      userId: req.user.id
    });
    
    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} recurring transaction(s)`
    });
  } catch (error) {
    console.error('Error batch deleting recurring transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error batch deleting recurring transactions',
      error: error.message
    });
  }
});

module.exports = router;
