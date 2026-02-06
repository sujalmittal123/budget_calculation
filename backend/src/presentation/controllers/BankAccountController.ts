import { Request, Response, NextFunction } from 'express';
import { BankAccountService } from '@services/BankAccountService';
import { CreateBankAccountSchema, UpdateBankAccountSchema } from '@dtos/bankAccount.dto';

export class BankAccountController {
  constructor(private bankAccountService: BankAccountService) {}

  createBankAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const validatedData = CreateBankAccountSchema.parse(req.body);
      
      const account = await this.bankAccountService.createBankAccount(userId, validatedData);
      
      res.status(201).json({
        success: true,
        data: account,
        message: 'Bank account created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getBankAccounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const activeOnly = req.query.activeOnly === 'true';
      
      const accounts = await this.bankAccountService.getBankAccounts(userId, activeOnly);
      
      res.json({
        success: true,
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  };

  getBankAccountById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      
      const account = await this.bankAccountService.getBankAccountById(userId, id);
      
      res.json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  };

  updateBankAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validatedData = UpdateBankAccountSchema.parse(req.body);
      
      const account = await this.bankAccountService.updateBankAccount(userId, id, validatedData);
      
      res.json({
        success: true,
        data: account,
        message: 'Bank account updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteBankAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      
      await this.bankAccountService.deleteBankAccount(userId, id);
      
      res.json({
        success: true,
        message: 'Bank account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
