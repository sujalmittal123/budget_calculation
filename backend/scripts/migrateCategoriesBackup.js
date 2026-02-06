/**
 * Migration Script: Update Old Categories to New System
 * 
 * This script migrates transactions from old category system (personal/business) 
 * to the new detailed category system.
 * 
 * Mapping:
 * - 'personal' -> 'Other Expense' (if expense) or 'Other Income' (if income)
 * - 'business' -> 'Other Expense' (if expense) or 'Other Income' (if income)
 * 
 * Usage:
 *   node scripts/migrateCategories.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

const migrateCategories = async () => {
  try {
    console.log('🔄 Starting category migration...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all transactions with old categories
    const oldTransactions = await Transaction.find({
      category: { $in: ['personal', 'business'] }
    });

    console.log(`📊 Found ${oldTransactions.length} transactions to migrate\n`);

    if (oldTransactions.length === 0) {
      console.log('✨ No transactions need migration. All up to date!\n');
      process.exit(0);
    }

    // Process each transaction
    let updated = 0;
    let errors = 0;

    for (const transaction of oldTransactions) {
      try {
        // Determine new category based on type
        let newCategory;
        if (transaction.type === 'expense') {
          newCategory = 'Other Expense';
        } else if (transaction.type === 'income') {
          newCategory = 'Other Income';
        } else {
          console.log(`⚠️  Unknown type "${transaction.type}" for transaction ${transaction._id}`);
          errors++;
          continue;
        }

        // Update the transaction
        await Transaction.findByIdAndUpdate(transaction._id, {
          category: newCategory,
          subcategory: transaction.category // Keep old category as subcategory for reference
        });

        updated++;
        
        // Progress indicator
        if (updated % 10 === 0) {
          console.log(`   Processed ${updated} transactions...`);
        }
      } catch (error) {
        console.error(`❌ Error updating transaction ${transaction._id}:`, error.message);
        errors++;
      }
    }

    console.log('\n✅ Migration completed!');
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total processed: ${oldTransactions.length}\n`);

    // Verify migration
    const remainingOld = await Transaction.countDocuments({
      category: { $in: ['personal', 'business'] }
    });

    if (remainingOld > 0) {
      console.log(`⚠️  Warning: ${remainingOld} transactions still have old categories\n`);
    } else {
      console.log('🎉 All transactions successfully migrated!\n');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
};

// Run migration
migrateCategories();
