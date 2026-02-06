/**
 * Global Currency Utility
 * Centralized currency formatting for the entire application
 */

export const CURRENCIES = {
  USD: { 
    symbol: '$', 
    locale: 'en-US',
    name: 'US Dollar',
    code: 'USD'
  },
  INR: { 
    symbol: '₹', 
    locale: 'en-IN',
    name: 'Indian Rupee',
    code: 'INR'
  },
  EUR: { 
    symbol: '€', 
    locale: 'de-DE',
    name: 'Euro',
    code: 'EUR'
  },
  GBP: { 
    symbol: '£', 
    locale: 'en-GB',
    name: 'British Pound',
    code: 'GBP'
  },
};

/**
 * Format a number as currency based on user's preference
 * @param {number} value - The amount to format
 * @param {string} currencyCode - Currency code (USD, INR, EUR, GBP)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currencyCode = 'USD') => {
  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
};

/**
 * Get currency symbol only
 * @param {string} currencyCode - Currency code (USD, INR, EUR, GBP)
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode = 'USD') => {
  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
  return config.symbol;
};

/**
 * Get currency configuration
 * @param {string} currencyCode - Currency code (USD, INR, EUR, GBP)
 * @returns {object} Currency configuration object
 */
export const getCurrencyConfig = (currencyCode = 'USD') => {
  return CURRENCIES[currencyCode] || CURRENCIES.USD;
};

export default {
  CURRENCIES,
  formatCurrency,
  getCurrencySymbol,
  getCurrencyConfig,
};
