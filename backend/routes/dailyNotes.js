const express = require('express');
const router = express.Router();
const DailyNote = require('../models/DailyNote');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/betterAuthMiddleware');

// All routes are protected
router.use(protect);

// @route   GET /api/daily-notes
// @desc    Get all daily notes for user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    
    const query = { userId: req.user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const notes = await DailyNote.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching daily notes',
      error: error.message
    });
  }
});

// @route   GET /api/daily-notes/:date
// @desc    Get daily note for a specific date
// @access  Private
router.get('/:date', async (req, res) => {
  try {
    const targetDate = new Date(req.params.date);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    let note = await DailyNote.findOne({
      userId: req.user._id,
      date: { $gte: targetDate, $lt: nextDate }
    });

    // Get transactions for this date
    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: targetDate, $lt: nextDate }
    }).sort({ createdAt: -1 });

    // Calculate daily totals
    const dailyTotals = transactions.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });

    res.json({
      success: true,
      data: {
        note,
        transactions,
        totals: {
          ...dailyTotals,
          balance: dailyTotals.income - dailyTotals.expense
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching daily note',
      error: error.message
    });
  }
});

// @route   POST /api/daily-notes
// @desc    Create or update daily note
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { date, notes, mood, dailyBudget, dailyTarget, highlights, tags } = req.body;
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Check if note exists for this date
    let note = await DailyNote.findOne({
      userId: req.user._id,
      date: { $gte: targetDate, $lt: nextDate }
    });

    if (note) {
      // Update existing note
      note.notes = notes || note.notes;
      note.mood = mood || note.mood;
      note.dailyBudget = dailyBudget !== undefined ? dailyBudget : note.dailyBudget;
      note.dailyTarget = dailyTarget !== undefined ? dailyTarget : note.dailyTarget;
      note.highlights = highlights || note.highlights;
      note.tags = tags || note.tags;
      await note.save();
    } else {
      // Create new note
      note = await DailyNote.create({
        userId: req.user._id,
        date: targetDate,
        notes,
        mood,
        dailyBudget,
        dailyTarget,
        highlights,
        tags
      });
    }

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving daily note',
      error: error.message
    });
  }
});

// @route   DELETE /api/daily-notes/:date
// @desc    Delete daily note
// @access  Private
router.delete('/:date', async (req, res) => {
  try {
    const targetDate = new Date(req.params.date);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const note = await DailyNote.findOneAndDelete({
      userId: req.user._id,
      date: { $gte: targetDate, $lt: nextDate }
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found for this date'
      });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting daily note',
      error: error.message
    });
  }
});

// @route   GET /api/daily-notes/stats/burn-rate
// @desc    Get monthly burn rate statistics
// @access  Private
router.get('/stats/burn-rate', async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const targetYear = parseInt(year) || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Get all expenses for the month
    const expenses = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          dailyTotal: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate statistics
    const totalExpense = expenses.reduce((sum, d) => sum + d.dailyTotal, 0);
    const daysWithExpense = expenses.length;
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    
    // Days elapsed in the current month (or full month if past)
    let daysElapsed;
    if (targetYear === now.getFullYear() && targetMonth === now.getMonth() + 1) {
      daysElapsed = now.getDate();
    } else if (new Date(targetYear, targetMonth - 1, 1) > now) {
      daysElapsed = 0;
    } else {
      daysElapsed = daysInMonth;
    }

    const averageDailyBurn = daysElapsed > 0 ? totalExpense / daysElapsed : 0;
    const projectedMonthlyExpense = averageDailyBurn * daysInMonth;
    const remainingDays = Math.max(0, daysInMonth - daysElapsed);
    const projectedRemainingExpense = averageDailyBurn * remainingDays;

    // Get highest and lowest spending days
    const sortedByAmount = [...expenses].sort((a, b) => b.dailyTotal - a.dailyTotal);
    const highestDay = sortedByAmount[0] || null;
    const lowestDay = sortedByAmount[sortedByAmount.length - 1] || null;

    // Calculate weekly burn rates
    const weeklyBurn = [];
    for (let week = 0; week < 5; week++) {
      const weekStart = new Date(targetYear, targetMonth - 1, week * 7 + 1);
      const weekEnd = new Date(targetYear, targetMonth - 1, (week + 1) * 7);
      
      const weekExpenses = expenses.filter(e => {
        const date = new Date(e._id);
        return date >= weekStart && date <= weekEnd;
      });
      
      const weekTotal = weekExpenses.reduce((sum, d) => sum + d.dailyTotal, 0);
      if (weekExpenses.length > 0) {
        weeklyBurn.push({
          week: week + 1,
          total: weekTotal,
          days: weekExpenses.length,
          average: weekTotal / weekExpenses.length
        });
      }
    }

    res.json({
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        totalExpense,
        daysWithExpense,
        daysElapsed,
        daysInMonth,
        remainingDays,
        averageDailyBurn: Math.round(averageDailyBurn * 100) / 100,
        projectedMonthlyExpense: Math.round(projectedMonthlyExpense * 100) / 100,
        projectedRemainingExpense: Math.round(projectedRemainingExpense * 100) / 100,
        highestSpendingDay: highestDay ? {
          date: highestDay._id,
          amount: highestDay.dailyTotal,
          transactions: highestDay.count
        } : null,
        lowestSpendingDay: lowestDay ? {
          date: lowestDay._id,
          amount: lowestDay.dailyTotal,
          transactions: lowestDay.count
        } : null,
        dailyBreakdown: expenses,
        weeklyBurn
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating burn rate',
      error: error.message
    });
  }
});

module.exports = router;
