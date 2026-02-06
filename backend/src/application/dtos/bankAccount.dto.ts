import { z } from 'zod';
import { BankAccountType } from '@entities/BankAccount.entity';

// Create Bank Account DTO
export const CreateBankAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100, 'Name cannot exceed 100 characters'),
  type: z.nativeEnum(BankAccountType),
  balance: z.number().default(0),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY']).default('INR'),
  isActive: z.boolean().default(true),
});

export type CreateBankAccountDTO = z.infer<typeof CreateBankAccountSchema>;

// Update Bank Account DTO
export const UpdateBankAccountSchema = CreateBankAccountSchema.partial();
export type UpdateBankAccountDTO = z.infer<typeof UpdateBankAccountSchema>;
