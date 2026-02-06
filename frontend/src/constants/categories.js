import {
  FiDollarSign,
  FiBriefcase,
  FiTrendingUp,
  FiGift,
  FiMoreHorizontal,
  FiTruck,
  FiShoppingBag,
  FiZap,
  FiHeart,
  FiBook,
  FiHome,
  FiShield,
  FiCoffee,
  FiFilm,
  FiCreditCard,
  FiSmartphone,
} from 'react-icons/fi';

/**
 * Enhanced Category System for Budget Tracker
 * 
 * Categories organized by transaction type with:
 * - Icon mapping for UI
 * - Color coding for charts
 * - Subcategory options for detailed tracking
 */

// Income Categories
export const INCOME_CATEGORIES = [
  {
    value: 'Salary',
    label: 'Salary',
    icon: FiDollarSign,
    color: '#22c55e',
    subcategories: ['Regular Salary', 'Bonus', 'Commission', 'Overtime']
  },
  {
    value: 'Freelance',
    label: 'Freelance',
    icon: FiBriefcase,
    color: '#3b82f6',
    subcategories: ['Project Payment', 'Consulting', 'Contract Work', 'Gig Work']
  },
  {
    value: 'Investment',
    label: 'Investment',
    icon: FiTrendingUp,
    color: '#8b5cf6',
    subcategories: ['Dividends', 'Interest', 'Capital Gains', 'Rental Income']
  },
  {
    value: 'Gift',
    label: 'Gift',
    icon: FiGift,
    color: '#ec4899',
    subcategories: ['Birthday', 'Wedding', 'Holiday', 'Other']
  },
  {
    value: 'Other Income',
    label: 'Other Income',
    icon: FiMoreHorizontal,
    color: '#6b7280',
    subcategories: ['Refund', 'Cashback', 'Reimbursement', 'Miscellaneous']
  }
];

// Expense Categories
export const EXPENSE_CATEGORIES = [
  {
    value: 'Food & Dining',
    label: 'Food & Dining',
    icon: FiCoffee,
    color: '#f59e0b',
    subcategories: ['Groceries', 'Restaurants', 'Coffee Shops', 'Food Delivery', 'Fast Food', 'Bakery']
  },
  {
    value: 'Transportation',
    label: 'Transportation',
    icon: FiTruck,
    color: '#3b82f6',
    subcategories: ['Fuel', 'Public Transit', 'Uber/Taxi', 'Parking', 'Vehicle Maintenance', 'Tolls']
  },
  {
    value: 'Shopping',
    label: 'Shopping',
    icon: FiShoppingBag,
    color: '#ec4899',
    subcategories: ['Clothing', 'Electronics', 'Home & Garden', 'Gifts', 'Books', 'Hobbies']
  },
  {
    value: 'Entertainment',
    label: 'Entertainment',
    icon: FiFilm,
    color: '#8b5cf6',
    subcategories: ['Movies', 'Concerts', 'Events', 'Streaming Services', 'Gaming', 'Sports']
  },
  {
    value: 'Bills & Utilities',
    label: 'Bills & Utilities',
    icon: FiZap,
    color: '#ef4444',
    subcategories: ['Electricity', 'Water', 'Gas', 'Internet', 'Phone', 'Cable TV']
  },
  {
    value: 'Healthcare',
    label: 'Healthcare',
    icon: FiHeart,
    color: '#ef4444',
    subcategories: ['Doctor Visits', 'Pharmacy', 'Dental', 'Vision', 'Lab Tests', 'Health Insurance']
  },
  {
    value: 'Education',
    label: 'Education',
    icon: FiBook,
    color: '#3b82f6',
    subcategories: ['Tuition', 'Books', 'Courses', 'Supplies', 'Student Loans', 'Tutoring']
  },
  {
    value: 'Rent',
    label: 'Rent',
    icon: FiHome,
    color: '#6366f1',
    subcategories: ['House Rent', 'Apartment Rent', 'Storage', 'Property Tax', 'HOA Fees']
  },
  {
    value: 'Insurance',
    label: 'Insurance',
    icon: FiShield,
    color: '#0ea5e9',
    subcategories: ['Health Insurance', 'Car Insurance', 'Home Insurance', 'Life Insurance', 'Other Insurance']
  },
  {
    value: 'Other Expense',
    label: 'Other Expense',
    icon: FiMoreHorizontal,
    color: '#6b7280',
    subcategories: ['Personal Care', 'Pet Care', 'Donations', 'Subscriptions', 'Fees', 'Miscellaneous']
  }
];

// Combined categories map for quick lookup
export const ALL_CATEGORIES = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES
];

// Get category by value
export const getCategoryByValue = (value) => {
  return ALL_CATEGORIES.find(cat => cat.value === value);
};

// Get categories by transaction type
export const getCategoriesByType = (type) => {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
};

// Get subcategories for a category
export const getSubcategories = (categoryValue) => {
  const category = getCategoryByValue(categoryValue);
  return category?.subcategories || [];
};

// Get category color
export const getCategoryColor = (categoryValue) => {
  const category = getCategoryByValue(categoryValue);
  return category?.color || '#6b7280';
};

// Get category icon
export const getCategoryIcon = (categoryValue) => {
  const category = getCategoryByValue(categoryValue);
  return category?.icon || FiMoreHorizontal;
};

// Payment method options
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: FiDollarSign },
  { value: 'card', label: 'Card', icon: FiCreditCard },
  { value: 'upi', label: 'UPI', icon: FiSmartphone },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: FiTruck },
  { value: 'cheque', label: 'Cheque', icon: FiBook },
  { value: 'other', label: 'Other', icon: FiMoreHorizontal }
];

// Export for backward compatibility
export default {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  ALL_CATEGORIES,
  PAYMENT_METHODS,
  getCategoryByValue,
  getCategoriesByType,
  getSubcategories,
  getCategoryColor,
  getCategoryIcon,
};
