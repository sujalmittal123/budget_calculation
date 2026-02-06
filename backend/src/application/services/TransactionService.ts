import { ITransactionRepository } from '@interfaces/repositories/ITransactionRepository';
import { IBankAccountRepository } from '@interfaces/repositories/IBankAccountRepository';
import { TransactionEntity, TransactionType } from '@entities/Transaction.entity';
import { CreateTransactionDTO, UpdateTransactionDTO } from '@dtos/transaction.dto';

export class TransactionService {
  constructor(
    private transactionRepo: ITransactionRepository,
    private bankAccountRepo: IBankAccountRepository
  ) {}

  async createTransaction(userId: string, data: CreateTransactionDTO): Promise<TransactionEntity> {
    // Validate bank account ownership
    const bankAccount = await this.bankAccountRepo.findById(data.bankAccountId);
    if (!bankAccount) {
      throw new Error('Bank account not found');
    }
    if (bankAccount.userId !== userId) {
      throw new Error('Not authorized to use this bank account');
    }

    // Create transaction
    const transaction = await this.transactionRepo.create({
      ...data,
      userId,
    });

    // Update bank account balance
    const balanceChange = data.type === TransactionType.INCOME ? data.amount : -data.amount;
    await this.bankAccountRepo.updateBalance(data.bankAccountId, balanceChange);

    return transaction;
  }

  async getTransactions(userId: string, filters?: any): Promise<TransactionEntity[]> {
    return this.transactionRepo.findByUserId(userId, filters);
  }

  async getTransactionById(userId: string, id: string): Promise<TransactionEntity> {
    const transaction = await this.transactionRepo.findById(id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    if (transaction.userId !== userId) {
      throw new Error('Not authorized to access this transaction');
    }
    return transaction;
  }

  async updateTransaction(userId: string, id: string, data: UpdateTransactionDTO): Promise<TransactionEntity> {
    const existing = await this.getTransactionById(userId, id);
    
    // If amount or type changed, update bank account balance
    if (data.amount !== undefined || data.type !== undefined) {
      const oldBalanceChange = existing.type === TransactionType.INCOME ? existing.amount : -existing.amount;
      await this.bankAccountRepo.updateBalance(existing.bankAccountId, -oldBalanceChange);

      const newAmount = data.amount ?? existing.amount;
      const newType = data.type ?? existing.type;
      const newBalanceChange = newType === TransactionType.INCOME ? newAmount : -newAmount;
      await this.bankAccountRepo.updateBalance(existing.bankAccountId, newBalanceChange);
    }

    const updated = await this.transactionRepo.update(id, data);
    if (!updated) {
      throw new Error('Failed to update transaction');
    }
    return updated;
  }

  async deleteTransaction(userId: string, id: string): Promise<void> {
    const transaction = await this.getTransactionById(userId, id);
    
    // Reverse balance change
    const balanceChange = transaction.type === TransactionType.INCOME ? -transaction.amount : transaction.amount;
    await this.bankAccountRepo.updateBalance(transaction.bankAccountId, balanceChange);

    await this.transactionRepo.delete(id);
  }

  async getTransactionStats(userId: string, startDate?: Date, endDate?: Date) {
    const filters = { startDate, endDate };
    
    const [totalIncome, totalExpense, transactionCount] = await Promise.all([
      this.transactionRepo.getTotalByType(userId, TransactionType.INCOME, filters),
      this.transactionRepo.getTotalByType(userId, TransactionType.EXPENSE, filters),
      this.transactionRepo.countByUserId(userId, filters),
    ]);

    return {
      totalIncome,
      totalExpense,
      netAmount: totalIncome - totalExpense,
      transactionCount,
    };
  }
}
