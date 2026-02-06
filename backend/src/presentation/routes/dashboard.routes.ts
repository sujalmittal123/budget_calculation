import { Router } from 'express';
import { DashboardController } from '@controllers/DashboardController';
import { TransactionService } from '@services/TransactionService';
import { BankAccountService } from '@services/BankAccountService';
import { TransactionRepository } from '@/infrastructure/repositories/TransactionRepository';
import { BankAccountRepository } from '@/infrastructure/repositories/BankAccountRepository';
import { requireAuth } from '@middleware/auth.middleware';

const router = Router();

// Dependency injection
const transactionRepo = new TransactionRepository();
const bankAccountRepo = new BankAccountRepository();
const transactionService = new TransactionService(transactionRepo, bankAccountRepo);
const bankAccountService = new BankAccountService(bankAccountRepo);
const dashboardController = new DashboardController(transactionService, bankAccountService);

// All dashboard routes require authentication
router.use(requireAuth);

// Dashboard endpoints
router.get('/summary', dashboardController.getSummary);
router.get('/category-breakdown', dashboardController.getCategoryBreakdown);
router.get('/monthly-trend', dashboardController.getMonthlyTrend);
router.get('/bank-summary', dashboardController.getBankSummary);
router.get('/recent-transactions', dashboardController.getRecentTransactions);
router.get('/payment-method-breakdown', dashboardController.getPaymentMethodBreakdown);

export default router;
