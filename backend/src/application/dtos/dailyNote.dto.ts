import { z } from 'zod';
import { NoteMood } from '@entities/DailyNote.entity';

// Create Daily Note DTO
export const CreateDailyNoteSchema = z.object({
  date: z.string().datetime().transform(str => new Date(str)),
  content: z.string().min(1, 'Content is required').max(5000, 'Content cannot exceed 5000 characters'),
  mood: z.nativeEnum(NoteMood).optional(),
  tags: z.array(z.string().trim().toLowerCase()).max(10, 'Cannot exceed 10 tags').default([]),
});

export type CreateDailyNoteDTO = z.infer<typeof CreateDailyNoteSchema>;

// Update Daily Note DTO
export const UpdateDailyNoteSchema = CreateDailyNoteSchema.partial();
export type UpdateDailyNoteDTO = z.infer<typeof UpdateDailyNoteSchema>;
