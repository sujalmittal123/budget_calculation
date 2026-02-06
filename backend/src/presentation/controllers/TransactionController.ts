import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '@services/TransactionService';
import { CreateTransactionSchema, UpdateTransactionSchema, TransactionFiltersSchema } from '@dtos/transaction.dto';

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  createTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const validatedData = CreateTransactionSchema.parse(req.body);
      
      const transaction = await this.transactionService.createTransaction(userId, validatedData);
      
      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Transaction created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const filters = TransactionFiltersSchema.parse(req.query);
      
      const transactions = await this.transactionService.getTransactions(userId, filters);
      
      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  };

  getTransactionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      
      const transaction = await this.transactionService.getTransactionById(userId, id);
      
      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  };

  updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validatedData = UpdateTransactionSchema.parse(req.body);
      
      const transaction = await this.transactionService.updateTransaction(userId, id, validatedData);
      
      res.json({
        success: true,
        data: transaction,
        message: 'Transaction updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      
      await this.transactionService.deleteTransaction(userId, id);
      
      res.json({
        success: true,
        message: 'Transaction deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;
      
      const stats = await this.transactionService.getTransactionStats(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}
