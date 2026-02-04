const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const BankAccount = require('../models/BankAccount');
const User = require('../models/User');
const { protect } = require('../middleware/betterAuthMiddleware');

// All routes are protected
router.use(protect);

// @route   GET /api/dashboard/summary
// @desc    Get dashboard summary (income, expense, balance)
// @access  Private
router.get('/summary', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Default to current month if not specified
    const now = new Date();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const targetYear = parseInt(year) || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Get monthly totals
    const monthlyStats = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
          },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    // Get all-time totals
    const allTimeStats = await Transaction.aggregate([
      {
        $match: { userId: req.user._id }
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
          }
        }
      }
    ]);

    // Get total bank balance
    const bankAccounts = await BankAccount.find({ 
      userId: req.user.id,
      isActive: true 
    });
    const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Get user's budget limit
    const user = await User.findById(req.user.id);

    const monthly = monthlyStats[0] || { totalIncome: 0, totalExpense: 0, transactionCount: 0 };
    const allTime = allTimeStats[0] || { totalIncome: 0, totalExpense: 0 };

    res.json({
      success: true,
      data: {
        monthly: {
          income: monthly.totalIncome,
          expense: monthly.totalExpense,
          balance: monthly.totalIncome - monthly.totalExpense,
          transactionCount: monthly.transactionCount,
          month: targetMonth,
          year: targetYear
        },
        allTime: {
          income: allTime.totalIncome,
          expense: allTime.totalExpense,
          balance: allTime.totalIncome - allTime.totalExpense
        },
        totalBankBalance,
        budgetLimit: user.monthlyBudgetLimit,
        budgetUsedPercent: user.monthlyBudgetLimit > 0 
          ? Math.round((monthly.totalExpense / user.monthlyBudgetLimit) * 100) 
          : 0,
        isOverBudget: user.monthlyBudgetLimit > 0 && monthly.totalExpense > user.monthlyBudgetLimit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/category-breakdown
// @desc    Get expense breakdown by category
// @access  Private
router.get('/category-breakdown', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const now = new Date();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const targetYear = parseInt(year) || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    // Calculate percentages
    const totalExpense = categoryBreakdown.reduce((sum, cat) => sum + cat.total, 0);
    const withPercentage = categoryBreakdown.map(cat => ({
      ...cat,
      percentage: totalExpense > 0 ? Math.round((cat.total / totalExpense) * 100) : 0
    }));

    res.json({
      success: true,
      data: withPercentage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category breakdown',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/monthly-trend
// @desc    Get monthly spending trend for last 12 months
// @access  Private
router.get('/monthly-trend', async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    const monthlyTrend = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          income: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
          },
          expense: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          income: 1,
          expense: 1,
          balance: { $subtract: ['$income', '$expense'] },
          _id: 0
        }
      }
    ]);

    // Fill in missing months with zero values
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const existing = monthlyTrend.find(m => m.year === year && m.month === month);
      months.push({
        year,
        month,
        monthName: date.toLocaleString('default', { month: 'short' }),
        income: existing?.income || 0,
        expense: existing?.expense || 0,
        balance: existing?.balance || 0
      });
    }

    res.json({
      success: true,
      data: months
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly trend',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/bank-summary
// @desc    Get bank-wise balance summary
// @access  Private
router.get('/bank-summary', async (req, res) => {
  try {
    const bankAccounts = await BankAccount.find({
      userId: req.user.id,
      isActive: true
    });

    const bankSummary = await Promise.all(
      bankAccounts.map(async (bank) => {
        const stats = await Transaction.aggregate([
          { $match: { bankId: bank._id } },
          {
            $group: {
              _id: null,
              totalIncome: {
                $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
              },
              totalExpense: {
                $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
              },
              transactionCount: { $sum: 1 }
            }
          }
        ]);

        const bankStats = stats[0] || { totalIncome: 0, totalExpense: 0, transactionCount: 0 };

        return {
          id: bank._id,
          bankName: bank.bankName,
          accountType: bank.accountType,
          balance: bank.balance,
          color: bank.color,
          maskedAccountNumber: bank.maskedAccountNumber,
          totalIncome: bankStats.totalIncome,
          totalExpense: bankStats.totalExpense,
          transactionCount: bankStats.transactionCount
        };
      })
    );

    res.json({
      success: true,
      data: bankSummary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bank summary',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/recent-transactions
// @desc    Get recent transactions
// @access  Private
router.get('/recent-transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const transactions = await Transaction.find({ userId: req.user.id })
      .populate('bankId', 'bankName color')
      .sort({ date: -1, createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent transactions',
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/payment-method-breakdown
// @desc    Get breakdown by payment method
// @access  Private
router.get('/payment-method-breakdown', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const now = new Date();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const targetYear = parseInt(year) || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const breakdown = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          paymentMethod: '$_id',
          total: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment method breakdown',
      error: error.message
    });
  }
});

module.exports = router;
