import { IBankAccountRepository } from '@interfaces/repositories/IBankAccountRepository';
import { BankAccountEntity } from '@entities/BankAccount.entity';
import { BankAccountModel } from '@/infrastructure/database/schemas/BankAccount.schema';

export class BankAccountRepository implements IBankAccountRepository {
  async create(data: Omit<BankAccountEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankAccountEntity> {
    const account = await BankAccountModel.create(data);
    return this.toEntity(account);
  }

  async findById(id: string): Promise<BankAccountEntity | null> {
    const account = await BankAccountModel.findById(id);
    return account ? this.toEntity(account) : null;
  }

  async findByUserId(userId: string): Promise<BankAccountEntity[]> {
    const accounts = await BankAccountModel.find({ userId }).sort({ createdAt: -1 });
    return accounts.map(a => this.toEntity(a));
  }

  async findActiveByUserId(userId: string): Promise<BankAccountEntity[]> {
    const accounts = await BankAccountModel.find({ userId, isActive: true }).sort({ createdAt: -1 });
    return accounts.map(a => this.toEntity(a));
  }

  async update(id: string, data: Partial<BankAccountEntity>): Promise<BankAccountEntity | null> {
    const account = await BankAccountModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return account ? this.toEntity(account) : null;
  }

  async updateBalance(id: string, amount: number): Promise<BankAccountEntity | null> {
    const account = await BankAccountModel.findByIdAndUpdate(
      id,
      { $inc: { balance: amount } },
      { new: true }
    );
    return account ? this.toEntity(account) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await BankAccountModel.findByIdAndDelete(id);
    return result !== null;
  }

  private toEntity(doc: any): BankAccountEntity {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      name: doc.name,
      type: doc.type,
      balance: doc.balance,
      currency: doc.currency,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}
