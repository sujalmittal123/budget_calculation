import { Router } from 'express';
import { BankAccountController } from '@controllers/BankAccountController';
import { BankAccountService } from '@services/BankAccountService';
import { BankAccountRepository } from '@/infrastructure/repositories/BankAccountRepository';
import { requireAuth } from '@middleware/auth.middleware';

const router = Router();

// Dependency injection
const bankAccountRepo = new BankAccountRepository();
const bankAccountService = new BankAccountService(bankAccountRepo);
const bankAccountController = new BankAccountController(bankAccountService);

// Protect all routes
router.use(requireAuth);

// Routes
router.post('/', bankAccountController.createBankAccount);
router.get('/', bankAccountController.getBankAccounts);
router.get('/:id', bankAccountController.getBankAccountById);
router.put('/:id', bankAccountController.updateBankAccount);
router.delete('/:id', bankAccountController.deleteBankAccount);

export default router;
