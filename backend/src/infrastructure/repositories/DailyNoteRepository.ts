import { IDailyNoteRepository } from '@interfaces/repositories/IDailyNoteRepository';
import { DailyNoteEntity } from '@entities/DailyNote.entity';
import { DailyNoteModel } from '@/infrastructure/database/schemas/DailyNote.schema';

export class DailyNoteRepository implements IDailyNoteRepository {
  async create(data: Omit<DailyNoteEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyNoteEntity> {
    const note = await DailyNoteModel.create(data);
    return this.toEntity(note);
  }

  async findById(id: string): Promise<DailyNoteEntity | null> {
    const note = await DailyNoteModel.findById(id);
    return note ? this.toEntity(note) : null;
  }

  async findByUserId(userId: string, limit: number = 30): Promise<DailyNoteEntity[]> {
    const notes = await DailyNoteModel.find({ userId })
      .sort({ date: -1 })
      .limit(limit);
    return notes.map(n => this.toEntity(n));
  }

  async findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<DailyNoteEntity[]> {
    const notes = await DailyNoteModel.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
    return notes.map(n => this.toEntity(n));
  }

  async findByUserIdAndDate(userId: string, date: Date): Promise<DailyNoteEntity | null> {
    // Find note for the exact date (ignoring time)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const note = await DailyNoteModel.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    return note ? this.toEntity(note) : null;
  }

  async update(id: string, data: Partial<DailyNoteEntity>): Promise<DailyNoteEntity | null> {
    const note = await DailyNoteModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return note ? this.toEntity(note) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await DailyNoteModel.findByIdAndDelete(id);
    return result !== null;
  }

  private toEntity(doc: any): DailyNoteEntity {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      date: doc.date,
      content: doc.content,
      mood: doc.mood,
      tags: doc.tags,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}
