import { DailyNoteEntity } from '@entities/DailyNote.entity';

export interface IDailyNoteRepository {
  create(data: Omit<DailyNoteEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyNoteEntity>;
  findById(id: string): Promise<DailyNoteEntity | null>;
  findByUserId(userId: string, limit?: number): Promise<DailyNoteEntity[]>;
  findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<DailyNoteEntity[]>;
  findByUserIdAndDate(userId: string, date: Date): Promise<DailyNoteEntity | null>;
  update(id: string, data: Partial<DailyNoteEntity>): Promise<DailyNoteEntity | null>;
  delete(id: string): Promise<boolean>;
}
