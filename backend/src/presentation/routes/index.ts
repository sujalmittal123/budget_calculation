import { Router } from 'express';
import authRoutes from './auth.routes';
import transactionRoutes from './transaction.routes';
import bankAccountRoutes from './bankAccount.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/bank-accounts', bankAccountRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
