import { BankAccountEntity } from '@entities/BankAccount.entity';

export interface IBankAccountRepository {
  create(data: Omit<BankAccountEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankAccountEntity>;
  findById(id: string): Promise<BankAccountEntity | null>;
  findByUserId(userId: string): Promise<BankAccountEntity[]>;
  findActiveByUserId(userId: string): Promise<BankAccountEntity[]>;
  update(id: string, data: Partial<BankAccountEntity>): Promise<BankAccountEntity | null>;
  updateBalance(id: string, amount: number): Promise<BankAccountEntity | null>;
  delete(id: string): Promise<boolean>;
}
