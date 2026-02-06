import mongoose, { Schema, Document } from 'mongoose';
import { DailyNoteEntity, NoteMood } from '@entities/DailyNote.entity';

export interface DailyNoteDocument extends Omit<DailyNoteEntity, 'id'>, Document {}

const DailyNoteSchema = new Schema<DailyNoteDocument>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      ref: 'User',
      index: true
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [5000, 'Content cannot exceed 5000 characters']
    },
    mood: {
      type: String,
      enum: Object.values(NoteMood),
      default: null
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes
DailyNoteSchema.index({ userId: 1, date: -1 });
DailyNoteSchema.index({ userId: 1, tags: 1 });

// Ensure one note per user per day
DailyNoteSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyNoteModel = mongoose.model<DailyNoteDocument>('DailyNote', DailyNoteSchema);
