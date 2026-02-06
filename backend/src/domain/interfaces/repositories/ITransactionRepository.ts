import { TransactionEntity } from '@entities/Transaction.entity';

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  type?: string;
  category?: string;
  bankAccountId?: string;
}

export interface ITransactionRepository {
  create(data: Omit<TransactionEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<TransactionEntity>;
  findById(id: string): Promise<TransactionEntity | null>;
  findByUserId(userId: string, filters?: TransactionFilters): Promise<TransactionEntity[]>;
  update(id: string, data: Partial<TransactionEntity>): Promise<TransactionEntity | null>;
  delete(id: string): Promise<boolean>;
  countByUserId(userId: string, filters?: TransactionFilters): Promise<number>;
  getTotalByType(userId: string, type: string, filters?: TransactionFilters): Promise<number>;
}
