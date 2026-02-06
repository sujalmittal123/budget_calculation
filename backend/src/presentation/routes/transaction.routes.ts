import { Router } from 'express';
import { TransactionController } from '@controllers/TransactionController';
import { TransactionService } from '@services/TransactionService';
import { TransactionRepository } from '@/infrastructure/repositories/TransactionRepository';
import { BankAccountRepository } from '@/infrastructure/repositories/BankAccountRepository';
import { requireAuth } from '@middleware/auth.middleware';

const router = Router();

// Dependency injection
const transactionRepo = new TransactionRepository();
const bankAccountRepo = new BankAccountRepository();
const transactionService = new TransactionService(transactionRepo, bankAccountRepo);
const transactionController = new TransactionController(transactionService);

// Protect all routes
router.use(requireAuth);

// Routes
router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/stats', transactionController.getStats);
router.get('/:id', transactionController.getTransactionById);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router;
