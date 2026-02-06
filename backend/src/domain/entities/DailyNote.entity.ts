export interface DailyNoteEntity {
  id: string;
  userId: string;
  date: Date;
  content: string;
  mood?: NoteMood;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum NoteMood {
  HAPPY = 'happy',
  NEUTRAL = 'neutral',
  SAD = 'sad',
  STRESSED = 'stressed',
  EXCITED = 'excited'
}
