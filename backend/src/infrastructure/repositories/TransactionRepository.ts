import { ITransactionRepository, TransactionFilters } from '@interfaces/repositories/ITransactionRepository';
import { TransactionEntity } from '@entities/Transaction.entity';
import { TransactionModel } from '@/infrastructure/database/schemas/Transaction.schema';

export class TransactionRepository implements ITransactionRepository {
  async create(data: Omit<TransactionEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<TransactionEntity> {
    const transaction = await TransactionModel.create(data);
    return this.toEntity(transaction);
  }

  async findById(id: string): Promise<TransactionEntity | null> {
    const transaction = await TransactionModel.findById(id);
    return transaction ? this.toEntity(transaction) : null;
  }

  async findByUserId(userId: string, filters?: TransactionFilters): Promise<TransactionEntity[]> {
    const query: any = { userId };

    if (filters) {
      if (filters.startDate || filters.endDate) {
        query.date = {};
        if (filters.startDate) query.date.$gte = filters.startDate;
        if (filters.endDate) query.date.$lte = filters.endDate;
      }
      if (filters.type) query.type = filters.type;
      if (filters.category) query.category = filters.category;
      if (filters.bankAccountId) query.bankAccountId = filters.bankAccountId;
    }

    const transactions = await TransactionModel.find(query).sort({ date: -1 });
    return transactions.map(t => this.toEntity(t));
  }

  async update(id: string, data: Partial<TransactionEntity>): Promise<TransactionEntity | null> {
    const transaction = await TransactionModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return transaction ? this.toEntity(transaction) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await TransactionModel.findByIdAndDelete(id);
    return result !== null;
  }

  async countByUserId(userId: string, filters?: TransactionFilters): Promise<number> {
    const query: any = { userId };
    if (filters) {
      if (filters.startDate || filters.endDate) {
        query.date = {};
        if (filters.startDate) query.date.$gte = filters.startDate;
        if (filters.endDate) query.date.$lte = filters.endDate;
      }
      if (filters.type) query.type = filters.type;
      if (filters.category) query.category = filters.category;
    }
    return TransactionModel.countDocuments(query);
  }

  async getTotalByType(userId: string, type: string, filters?: TransactionFilters): Promise<number> {
    const query: any = { userId, type };
    if (filters) {
      if (filters.startDate || filters.endDate) {
        query.date = {};
        if (filters.startDate) query.date.$gte = filters.startDate;
        if (filters.endDate) query.date.$lte = filters.endDate;
      }
    }

    const result = await TransactionModel.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  private toEntity(doc: any): TransactionEntity {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      bankAccountId: doc.bankAccountId,
      type: doc.type,
      amount: doc.amount,
      category: doc.category,
      description: doc.description,
      date: doc.date,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}
