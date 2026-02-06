const cron = require('node-cron');
const RecurringTransaction = require('../models/RecurringTransaction');

/**
 * Cron job to automatically generate due recurring transactions
 * Runs every day at 00:01 AM (1 minute past midnight)
 */
const startRecurringJob = () => {
  // Schedule: Run every day at 00:01 AM
  // Format: minute hour day month weekday
  // '1 0 * * *' = 1st minute, 0th hour (midnight), every day, every month, every weekday
  cron.schedule('1 0 * * *', async () => {
    const timestamp = new Date().toISOString();
    console.log(`\n[Cron] Starting recurring transaction generation job at ${timestamp}`);
    
    try {
      // Find all due recurring transactions across all users
      const dueRecurring = await RecurringTransaction.find({
        status: 'active',
        autoGenerate: true,
        nextDueDate: { $lte: new Date() }
      }).populate('bankId');
      
      console.log(`[Cron] Found ${dueRecurring.length} due recurring transaction(s)`);
      
      const results = {
        success: [],
        failed: [],
        skipped: []
      };
      
      for (const recurring of dueRecurring) {
        try {
          // Double-check if it's actually due (using the model method)
          if (recurring.isDue()) {
            // Generate the transaction
            const transaction = await recurring.generateTransaction();
            
            results.success.push({
              id: recurring._id,
              description: recurring.description,
              amount: recurring.amount,
              transactionId: transaction._id
            });
            
            console.log(`[Cron] ✅ Generated: ${recurring.description} (${recurring.type}: $${recurring.amount})`);
          } else {
            results.skipped.push({
              id: recurring._id,
              description: recurring.description,
              reason: 'Not yet due'
            });
            
            console.log(`[Cron] ⏭️  Skipped: ${recurring.description} (not yet due)`);
          }
        } catch (error) {
          results.failed.push({
            id: recurring._id,
            description: recurring.description,
            error: error.message
          });
          
          console.error(`[Cron] ❌ Failed to generate: ${recurring.description}`, error.message);
        }
      }
      
      // Log summary
      console.log(`\n[Cron] Generation Summary:`);
      console.log(`  ✅ Success: ${results.success.length}`);
      console.log(`  ❌ Failed: ${results.failed.length}`);
      console.log(`  ⏭️  Skipped: ${results.skipped.length}`);
      console.log(`[Cron] Job completed at ${new Date().toISOString()}\n`);
      
      // If there were failures, log them
      if (results.failed.length > 0) {
        console.error('[Cron] Failed transactions:', JSON.stringify(results.failed, null, 2));
      }
      
    } catch (error) {
      console.error('[Cron] ❌ Critical error in recurring transaction generation job:', error);
    }
  });
  
  console.log('[Cron] ✅ Recurring transaction job scheduled (daily at 00:01 AM)');
  console.log('[Cron] Job will generate transactions for all active recurring templates');
};

/**
 * Manual trigger function for testing/debugging
 * Can be called from API route or directly for testing
 */
const triggerManualGeneration = async () => {
  console.log('[Manual] Triggering manual recurring transaction generation...');
  
  try {
    const dueRecurring = await RecurringTransaction.find({
      status: 'active',
      autoGenerate: true,
      nextDueDate: { $lte: new Date() }
    }).populate('bankId');
    
    const results = {
      success: [],
      failed: []
    };
    
    for (const recurring of dueRecurring) {
      try {
        if (recurring.isDue()) {
          const transaction = await recurring.generateTransaction();
          results.success.push({
            recurring: recurring._id,
            transaction: transaction._id
          });
        }
      } catch (error) {
        results.failed.push({
          recurring: recurring._id,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      generated: results.success.length,
      failed: results.failed.length,
      results
    };
  } catch (error) {
    console.error('[Manual] Error in manual generation:', error);
    throw error;
  }
};

module.exports = { 
  startRecurringJob,
  triggerManualGeneration
};
