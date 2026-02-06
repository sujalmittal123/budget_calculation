import mongoose, { Schema, Document } from 'mongoose';
import { BankAccountEntity, BankAccountType } from '@entities/BankAccount.entity';

export interface BankAccountDocument extends Omit<BankAccountEntity, 'id'>, Document {}

const BankAccountSchema = new Schema<BankAccountDocument>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      ref: 'User',
      index: true
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    type: {
      type: String,
      required: [true, 'Account type is required'],
      enum: Object.values(BankAccountType),
      default: BankAccountType.SAVINGS
    },
    balance: {
      type: Number,
      required: [true, 'Balance is required'],
      default: 0
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'INR',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY']
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes
BankAccountSchema.index({ userId: 1, isActive: 1 });
BankAccountSchema.index({ userId: 1, createdAt: -1 });

export const BankAccountModel = mongoose.model<BankAccountDocument>('BankAccount', BankAccountSchema);
