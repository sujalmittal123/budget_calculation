import { z } from 'zod';
import { TransactionType } from '@entities/Transaction.entity';

// Create Transaction DTO
export const CreateTransactionSchema = z.object({
  bankAccountId: z.string().min(1, 'Bank account ID is required'),
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().default(''),
  date: z.string().datetime('Invalid date format').transform(str => new Date(str)),
});

export type CreateTransactionDTO = z.infer<typeof CreateTransactionSchema>;

// Update Transaction DTO
export const UpdateTransactionSchema = CreateTransactionSchema.partial();
export type UpdateTransactionDTO = z.infer<typeof UpdateTransactionSchema>;

// Transaction Filters DTO
export const TransactionFiltersSchema = z.object({
  startDate: z.string().datetime().transform(str => new Date(str)).optional(),
  endDate: z.string().datetime().transform(str => new Date(str)).optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  bankAccountId: z.string().optional(),
});

export type TransactionFiltersDTO = z.infer<typeof TransactionFiltersSchema>;
