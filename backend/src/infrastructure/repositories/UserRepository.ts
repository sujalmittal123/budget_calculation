import { IUserRepository } from '@interfaces/repositories/IUserRepository';
import { UserEntity } from '@entities/User.entity';
import { UserModel } from '@/infrastructure/database/schemas/User.schema';

export class UserRepository implements IUserRepository {
  async create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    const user = await UserModel.create(data);
    return this.toEntity(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await UserModel.findById(id);
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return user ? this.toEntity(user) : null;
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return user ? this.toEntity(user) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  }

  private toEntity(doc: any): UserEntity {
    return {
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      image: doc.image,
      emailVerified: doc.emailVerified,
      monthlyBudgetLimit: doc.monthlyBudgetLimit,
      preferences: doc.preferences,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}
