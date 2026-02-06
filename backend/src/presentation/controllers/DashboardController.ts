import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '@services/TransactionService';
import { BankAccountService } from '@services/BankAccountService';
import { TransactionModel } from '@/infrastructure/database/schemas/Transaction.schema';
import { TransactionType } from '@/domain/entities/Transaction.entity';

export class DashboardController {
  constructor(
    private transactionService: TransactionService,
    private bankAccountService: BankAccountService
  ) {}

  /**
   * GET /api/dashboard/summary
   * Returns overall financial summary
   */
  getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      // Get transaction stats (defaults to current month if no dates provided)
      const now = new Date();
      const monthStart = start || new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = end || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      const stats = await this.transactionService.getTransactionStats(userId, monthStart, monthEnd);
      
      // Get total balance from bank accounts
      const totalBankBalance = await this.bankAccountService.getTotalBalance(userId);
      
      res.json({
        success: true,
        data: {
          monthly: {
            income: stats.totalIncome,
            expense: stats.totalExpense,
            balance: stats.netAmount,
          },
          totalBankBalance,
          transactionCount: stats.transactionCount,
          budgetLimit: 0, // TODO: Get from user preferences
          budgetUsedPercent: 0,
          isOverBudget: false,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/dashboard/category-breakdown
   * Returns spending/income breakdown by category
   */
  getCategoryBreakdown = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { startDate, endDate, type } = req.query;

      const query: any = { userId };
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate as string);
        if (endDate) query.date.$lte = new Date(endDate as string);
      }

      if (type) {
        query.type = type;
      }

      // Aggregate transactions by category
      const breakdown = await TransactionModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]);

      // Calculate total for percentage
      const grandTotal = breakdown.reduce((sum, item) => sum + item.total, 0);

      res.json({
        success: true,
        data: breakdown.map((item) => ({
          category: item._id,
          total: item.total,
          count: item.count,
          percentage: grandTotal > 0 ? Math.round((item.total / grandTotal) * 100) : 0,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/dashboard/monthly-trend
   * Returns monthly income/expense trend for last 12 months
   */
  getMonthlyTrend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      // Get data for last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const trend = await TransactionModel.aggregate([
        {
          $match: {
            userId,
            date: { $gte: twelveMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              type: '$type',
            },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      // Transform data into a more usable format
      const monthlyData: { [key: string]: { income: number; expense: number } } = {};

      trend.forEach((item) => {
        const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
        if (!monthlyData[key]) {
          monthlyData[key] = { income: 0, expense: 0 };
        }
        if (item._id.type === TransactionType.INCOME) {
          monthlyData[key].income = item.total;
        } else {
          monthlyData[key].expense = item.total;
        }
      });

      // Convert to array format with month names
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const result = Object.entries(monthlyData).map(([month, data]) => {
        const [year, monthNum] = month.split('-');
        const monthName = `${monthNames[parseInt(monthNum) - 1]} ${year}`;
        
        return {
          month,
          monthName,
          income: data.income,
          expense: data.expense,
          net: data.income - data.expense,
        };
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/dashboard/bank-summary
   * Returns summary of all bank accounts with balances
   */
  getBankSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const accounts = await this.bankAccountService.getBankAccounts(userId, true);
      
      // Color mapping for different account types
      const colorMap: { [key: string]: string } = {
        savings: '#22c55e',
        checking: '#3b82f6',
        credit_card: '#ef4444',
        cash: '#f59e0b',
        investment: '#8b5cf6',
      };

      res.json({
        success: true,
        data: accounts.map((account) => ({
          id: account.id,
          bankName: account.name,
          type: account.type,
          balance: account.balance,
          isActive: account.isActive,
          color: colorMap[account.type] || '#6b7280',
          maskedAccountNumber: `****${account.id.slice(-4)}`, // Mock masked number
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/dashboard/recent-transactions
   * Returns most recent transactions
   */
  getRecentTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 10;

      const transactions = await TransactionModel.find({ userId })
        .sort({ date: -1, createdAt: -1 })
        .limit(limit)
        .lean();

      res.json({
        success: true,
        data: transactions.map((t) => ({
          id: t._id.toString(),
          type: t.type,
          amount: t.amount,
          category: t.category,
          description: t.description,
          date: t.date,
          bankAccountId: t.bankAccountId,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/dashboard/payment-method-breakdown
   * Returns breakdown by payment method (bank account)
   */
  getPaymentMethodBreakdown = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;

      const query: any = { userId };
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate as string);
        if (endDate) query.date.$lte = new Date(endDate as string);
      }

      // Aggregate by bank account
      const breakdown = await TransactionModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$bankAccountId',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]);

      // Get bank account details
      const accounts = await this.bankAccountService.getBankAccounts(userId);
      const accountMap = new Map(accounts.map((a) => [a.id, a]));

      res.json({
        success: true,
        data: breakdown.map((item) => {
          const account = accountMap.get(item._id);
          return {
            bankAccountId: item._id,
            bankAccountName: account?.name || 'Unknown',
            total: item.total,
            count: item.count,
          };
        }),
      });
    } catch (error) {
      next(error);
    }
  };
}
