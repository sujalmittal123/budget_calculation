export interface BankAccountEntity {
  id: string;
  userId: string;
  name: string;
  type: BankAccountType;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum BankAccountType {
  SAVINGS = 'savings',
  CHECKING = 'checking',
  CREDIT_CARD = 'credit_card',
  CASH = 'cash',
  INVESTMENT = 'investment'
}
