const Transaction = require('../models/Transaction');
const RecurringTransaction = require('../models/RecurringTransaction');

/**
 * AI-Powered Recurring Transaction Detector
 * 
 * Analyzes historical transactions to detect recurring patterns:
 * - Same amount (within tolerance)
 * - Same category and description
 * - Regular time intervals (monthly, weekly, etc.)
 * - Similar merchant/vendor
 */

class RecurringDetector {
  constructor() {
    this.AMOUNT_TOLERANCE = 0.05; // 5% tolerance for amount matching
    this.MIN_OCCURRENCES = 3; // Need at least 3 occurrences to detect pattern
    this.MIN_CONFIDENCE = 60; // Minimum confidence score to suggest
    this.LOOKBACK_MONTHS = 6; // Analyze last 6 months
  }

  /**
   * Detect all recurring patterns for a user
   */
  async detectPatternsForUser(userId) {
    console.log(`[RecurringDetector] Starting pattern detection for user ${userId}`);
    
    // Get historical transactions
    const lookbackDate = new Date();
    lookbackDate.setMonth(lookbackDate.getMonth() - this.LOOKBACK_MONTHS);
    
    const transactions = await Transaction.find({
      userId,
      date: { $gte: lookbackDate }
    }).sort({ date: 1 });
    
    console.log(`[RecurringDetector] Found ${transactions.length} transactions to analyze`);
    
    if (transactions.length < this.MIN_OCCURRENCES) {
      return [];
    }
    
    // Get existing recurring transactions to avoid duplicates
    const existingRecurring = await RecurringTransaction.find({ userId });
    const existingDescriptions = new Set(existingRecurring.map(r => r.description.toLowerCase()));
    
    // Group transactions by potential recurring patterns
    const patterns = this.groupByPatterns(transactions);
    
    // Analyze each pattern
    const detectedPatterns = [];
    
    for (const pattern of patterns) {
      // Skip if already exists
      if (existingDescriptions.has(pattern.description.toLowerCase())) {
        continue;
      }
      
      const analysis = this.analyzePattern(pattern);
      
      if (analysis.confidence >= this.MIN_CONFIDENCE && analysis.frequency) {
        detectedPatterns.push({
          ...pattern,
          ...analysis,
          sourceTransactionIds: pattern.transactions.map(t => t._id)
        });
      }
    }
    
    console.log(`[RecurringDetector] Detected ${detectedPatterns.length} recurring patterns`);
    return detectedPatterns;
  }

  /**
   * Group transactions by potential patterns
   */
  groupByPatterns(transactions) {
    const patterns = new Map();
    
    for (const transaction of transactions) {
      // Create a pattern key based on description similarity and amount
      const key = this.getPatternKey(transaction);
      
      if (!patterns.has(key)) {
        patterns.set(key, {
          description: transaction.description,
          category: transaction.category,
          subcategory: transaction.subcategory,
          type: transaction.type,
          bankId: transaction.bankId,
          paymentMethod: transaction.paymentMethod,
          amounts: [],
          dates: [],
          transactions: []
        });
      }
      
      const pattern = patterns.get(key);
      pattern.amounts.push(transaction.amount);
      pattern.dates.push(new Date(transaction.date));
      pattern.transactions.push(transaction);
    }
    
    // Filter patterns with minimum occurrences
    return Array.from(patterns.values()).filter(
      p => p.transactions.length >= this.MIN_OCCURRENCES
    );
  }

  /**
   * Create a pattern key for grouping similar transactions
   */
  getPatternKey(transaction) {
    // Normalize description (remove numbers, dates, etc.)
    const normalizedDesc = transaction.description
      .toLowerCase()
      .replace(/\d+/g, '') // Remove numbers
      .replace(/[^\w\s]/g, '') // Remove special chars
      .trim()
      .substring(0, 20); // Take first 20 chars
    
    // Round amount to nearest 10 for grouping
    const roundedAmount = Math.round(transaction.amount / 10) * 10;
    
    return `${normalizedDesc}_${transaction.category}_${roundedAmount}`;
  }

  /**
   * Analyze a pattern to determine if it's recurring
   */
  analyzePattern(pattern) {
    const dates = pattern.dates;
    const amounts = pattern.amounts;
    
    // Calculate intervals between transactions (in days)
    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
      const interval = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
      intervals.push(Math.round(interval));
    }
    
    // Detect frequency based on intervals
    const frequency = this.detectFrequency(intervals);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence({
      intervalConsistency: this.calculateIntervalConsistency(intervals),
      amountConsistency: this.calculateAmountConsistency(amounts),
      occurrences: pattern.transactions.length,
      frequency: frequency
    });
    
    // Calculate amount statistics
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    const amountVariance = maxAmount - minAmount;
    const isVariableAmount = (amountVariance / avgAmount) > 0.15; // >15% variance
    
    // Determine next due date
    const lastDate = dates[dates.length - 1];
    const nextDueDate = this.calculateNextDueDate(lastDate, frequency);
    
    // Determine day of month/week
    const dayOfMonth = frequency === 'monthly' ? lastDate.getDate() : 1;
    const dayOfWeek = frequency === 'weekly' ? lastDate.getDay() : 1;
    
    return {
      frequency,
      confidence: Math.round(confidence),
      amount: Math.round(avgAmount * 100) / 100,
      averageAmount: Math.round(avgAmount * 100) / 100,
      minAmount: Math.round(minAmount * 100) / 100,
      maxAmount: Math.round(maxAmount * 100) / 100,
      isVariableAmount,
      nextDueDate,
      dayOfMonth,
      dayOfWeek,
      detectionSource: this.getDetectionSource(pattern, intervals, amounts),
      occurrences: pattern.transactions.length
    };
  }

  /**
   * Detect frequency from intervals
   */
  detectFrequency(intervals) {
    if (intervals.length === 0) return null;
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    // Daily (every 1-2 days)
    if (avgInterval >= 1 && avgInterval <= 2) return 'daily';
    
    // Weekly (every 6-8 days)
    if (avgInterval >= 6 && avgInterval <= 8) return 'weekly';
    
    // Biweekly (every 13-15 days)
    if (avgInterval >= 13 && avgInterval <= 15) return 'biweekly';
    
    // Monthly (every 28-32 days)
    if (avgInterval >= 28 && avgInterval <= 32) return 'monthly';
    
    // Quarterly (every 88-95 days)
    if (avgInterval >= 88 && avgInterval <= 95) return 'quarterly';
    
    // Yearly (every 360-370 days)
    if (avgInterval >= 360 && avgInterval <= 370) return 'yearly';
    
    // If no clear pattern but consistent, assume monthly
    if (avgInterval >= 25 && avgInterval <= 35) return 'monthly';
    
    return null;
  }

  /**
   * Calculate interval consistency (0-1)
   */
  calculateIntervalConsistency(intervals) {
    if (intervals.length === 0) return 0;
    
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower std dev = higher consistency
    // Normalize to 0-1 scale (assume stdDev of 5 days is still acceptable)
    const consistency = Math.max(0, 1 - (stdDev / 5));
    
    return consistency;
  }

  /**
   * Calculate amount consistency (0-1)
   */
  calculateAmountConsistency(amounts) {
    if (amounts.length === 0) return 0;
    
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const maxDeviation = Math.max(...amounts.map(a => Math.abs(a - avg)));
    
    // If deviation is within 10%, high consistency
    const consistency = Math.max(0, 1 - (maxDeviation / avg / 0.10));
    
    return consistency;
  }

  /**
   * Calculate overall confidence score (0-100)
   */
  calculateConfidence({ intervalConsistency, amountConsistency, occurrences, frequency }) {
    if (!frequency) return 0;
    
    let score = 0;
    
    // Interval consistency (40 points max)
    score += intervalConsistency * 40;
    
    // Amount consistency (30 points max)
    score += amountConsistency * 30;
    
    // Number of occurrences (20 points max)
    score += Math.min(occurrences / 10, 1) * 20;
    
    // Frequency clarity (10 points max)
    const frequencyScores = {
      'monthly': 10,
      'weekly': 9,
      'biweekly': 8,
      'daily': 7,
      'quarterly': 6,
      'yearly': 5
    };
    score += frequencyScores[frequency] || 0;
    
    return Math.min(score, 100);
  }

  /**
   * Determine detection source
   */
  getDetectionSource(pattern, intervals, amounts) {
    const intervalConsistency = this.calculateIntervalConsistency(intervals);
    const amountConsistency = this.calculateAmountConsistency(amounts);
    
    if (intervalConsistency > 0.8 && amountConsistency > 0.9) {
      return 'pattern_detection'; // Perfect pattern
    } else if (amountConsistency > 0.95) {
      return 'amount_matching'; // Same amount recurring
    } else {
      return 'description_matching'; // Same description recurring
    }
  }

  /**
   * Calculate next due date based on last date and frequency
   */
  calculateNextDueDate(lastDate, frequency) {
    const next = new Date(lastDate);
    
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'biweekly':
        next.setDate(next.getDate() + 14);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        next.setMonth(next.getMonth() + 1);
    }
    
    return next;
  }

  /**
   * Create recurring transactions from detected patterns
   */
  async createFromPattern(userId, pattern) {
    const recurring = await RecurringTransaction.create({
      userId,
      bankId: pattern.bankId,
      type: pattern.type,
      category: pattern.category,
      subcategory: pattern.subcategory,
      amount: pattern.amount,
      description: pattern.description,
      paymentMethod: pattern.paymentMethod,
      frequency: pattern.frequency,
      startDate: new Date(),
      nextDueDate: pattern.nextDueDate,
      dayOfMonth: pattern.dayOfMonth,
      dayOfWeek: pattern.dayOfWeek,
      isAutoDetected: true,
      detectionSource: pattern.detectionSource,
      confidenceScore: pattern.confidence,
      sourceTransactionIds: pattern.sourceTransactionIds,
      isVariableAmount: pattern.isVariableAmount,
      averageAmount: pattern.averageAmount,
      minAmount: pattern.minAmount,
      maxAmount: pattern.maxAmount,
      status: 'active',
      autoGenerate: false // Don't auto-generate until user approves
    });
    
    return recurring;
  }
}

module.exports = new RecurringDetector();
