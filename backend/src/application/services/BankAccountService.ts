import { IBankAccountRepository } from '@interfaces/repositories/IBankAccountRepository';
import { BankAccountEntity } from '@entities/BankAccount.entity';
import { CreateBankAccountDTO, UpdateBankAccountDTO } from '@dtos/bankAccount.dto';

export class BankAccountService {
  constructor(private bankAccountRepo: IBankAccountRepository) {}

  async createBankAccount(userId: string, data: CreateBankAccountDTO): Promise<BankAccountEntity> {
    return this.bankAccountRepo.create({
      ...data,
      userId,
    });
  }

  async getBankAccounts(userId: string, activeOnly: boolean = false): Promise<BankAccountEntity[]> {
    if (activeOnly) {
      return this.bankAccountRepo.findActiveByUserId(userId);
    }
    return this.bankAccountRepo.findByUserId(userId);
  }

  async getBankAccountById(userId: string, id: string): Promise<BankAccountEntity> {
    const account = await this.bankAccountRepo.findById(id);
    if (!account) {
      throw new Error('Bank account not found');
    }
    if (account.userId !== userId) {
      throw new Error('Not authorized to access this bank account');
    }
    return account;
  }

  async updateBankAccount(userId: string, id: string, data: UpdateBankAccountDTO): Promise<BankAccountEntity> {
    await this.getBankAccountById(userId, id); // Verify ownership
    const updated = await this.bankAccountRepo.update(id, data);
    if (!updated) {
      throw new Error('Failed to update bank account');
    }
    return updated;
  }

  async deleteBankAccount(userId: string, id: string): Promise<void> {
    await this.getBankAccountById(userId, id); // Verify ownership
    await this.bankAccountRepo.delete(id);
  }

  async getTotalBalance(userId: string): Promise<number> {
    const accounts = await this.bankAccountRepo.findActiveByUserId(userId);
    return accounts.reduce((total, account) => total + account.balance, 0);
  }
}
