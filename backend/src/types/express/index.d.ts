import { UserEntity } from '@entities/User.entity';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        image?: string;
        emailVerified: Date | null;
        monthlyBudgetLimit: number;
        preferences: UserEntity['preferences'];
      };
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export {};
