export interface UserEntity {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified: Date | null;
  monthlyBudgetLimit: number;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  darkMode: boolean;
  currency: string;
  notifications: boolean;
}
