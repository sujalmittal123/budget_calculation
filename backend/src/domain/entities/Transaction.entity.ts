export interface TransactionEntity {
  id: string;
  userId: string;
  bankAccountId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum TransactionCategory {
  // Income categories
  SALARY = 'Salary',
  FREELANCE = 'Freelance',
  INVESTMENT = 'Investment',
  GIFT = 'Gift',
  OTHER_INCOME = 'Other Income',
  
  // Expense categories
  FOOD = 'Food & Dining',
  TRANSPORT = 'Transportation',
  SHOPPING = 'Shopping',
  ENTERTAINMENT = 'Entertainment',
  BILLS = 'Bills & Utilities',
  HEALTHCARE = 'Healthcare',
  EDUCATION = 'Education',
  RENT = 'Rent',
  INSURANCE = 'Insurance',
  OTHER_EXPENSE = 'Other Expense'
}
