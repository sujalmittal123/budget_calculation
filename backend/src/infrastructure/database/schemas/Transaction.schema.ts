import mongoose, { Schema, Document } from 'mongoose';
import { TransactionEntity, TransactionType, TransactionCategory } from '@entities/Transaction.entity';

export interface TransactionDocument extends Omit<TransactionEntity, 'id'>, Document {}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      ref: 'User',
      index: true
    },
    bankAccountId: {
      type: String,
      required: [true, 'Bank account ID is required'],
      ref: 'BankAccount',
      index: true
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: Object.values(TransactionType),
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: Object.values(TransactionCategory)
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes for common queries
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1, date: -1 });
TransactionSchema.index({ userId: 1, category: 1, date: -1 });
TransactionSchema.index({ bankAccountId: 1, date: -1 });

export const TransactionModel = mongoose.model<TransactionDocument>('Transaction', TransactionSchema);
