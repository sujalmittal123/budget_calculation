# Recurring Transactions - User Guide

## Overview
The Recurring Transactions feature allows you to automatically manage repeating income and expenses with AI-powered pattern detection.

---

## Features

### 1. AI Pattern Detection
- **Automatically detects** recurring patterns from your transaction history
- Analyzes the last **6 months** of transactions
- Requires at least **3 occurrences** to detect a pattern
- Shows **confidence score** (0-100%) based on:
  - Consistency of intervals (40 points)
  - Consistency of amounts (30 points)
  - Number of occurrences (20 points)
  - Frequency clarity (10 points)

### 2. Auto-Generation
- **Cron job runs daily** at 00:01 AM
- Automatically creates transactions when due
- Only generates for active recurring items
- Updates next due date after generation
- Links generated transactions to template

### 3. Manual Management
- Create recurring transactions manually
- Edit existing recurring transactions
- Pause/Resume to temporarily stop generation
- Delete when no longer needed
- Generate transaction immediately (on-demand)

---

## How to Use

### Accessing the Feature
1. Navigate to **Dashboard**
2. Click **"Recurring"** in the sidebar (between Transactions and Bank Accounts)
3. The icon is a circular repeat symbol (⟳)

---

## Tabs Explained

### 📊 Active Tab
Shows all your active and paused recurring transactions.

**Each card displays:**
- Transaction type (Income ↑ or Expense ↓)
- Description and category
- Amount
- Frequency (Daily, Weekly, Monthly, etc.)
- Next due date
- Status (Active/Paused)
- AI Detection badge (if auto-detected)

**Actions available:**
- ⏸️ **Pause** - Temporarily stop auto-generation
- ▶️ **Resume** - Restart auto-generation
- ⚡ **Generate Now** - Create transaction immediately
- ✏️ **Edit** - Modify details
- 🗑️ **Delete** - Remove permanently

### 🔍 Detected Patterns Tab
Shows AI-detected recurring patterns from your transaction history.

**Pattern cards show:**
- Description
- Category
- Average amount
- Detected frequency
- **Confidence score** (color-coded):
  - 🟢 Green (80-100%): High confidence
  - 🟡 Amber (60-79%): Medium confidence
  - 🔴 Red (<60%): Low confidence (not shown by default)
- Number of occurrences analyzed
- Detection source (pattern/amount/description matching)

**Actions available:**
- ✅ **Approve** - Convert pattern to recurring transaction
- ✅ **Approve All** - Convert all patterns at once

### 📅 Upcoming Tab
Shows all transactions scheduled for the next 30 days.

**Displays:**
- Transaction details
- Scheduled date
- Amount

---

## Creating a Recurring Transaction

### Method 1: Manual Creation
1. Click **"Add Recurring"** button (top right)
2. Fill in the form:
   - **Type**: Income or Expense
   - **Category**: Select from dropdown
   - **Description**: e.g., "Netflix Subscription"
   - **Amount**: Dollar amount
   - **Frequency**: Daily, Weekly, Bi-weekly, Monthly, Quarterly, Yearly
   - **Start Date**: When to begin
   - **Auto Generate**: Check to enable automatic creation
3. Click **"Create"**

### Method 2: Approve AI Detection
1. Go to **"Detected Patterns"** tab
2. Review detected patterns
3. Click **"Approve"** on any pattern
4. System creates recurring transaction automatically

---

## Frequency Options

| Frequency | Generates Every |
|-----------|----------------|
| Daily | 1 day |
| Weekly | 7 days |
| Bi-weekly | 14 days |
| Monthly | 1 month (same day) |
| Quarterly | 3 months |
| Yearly | 1 year |

---

## Examples

### Example 1: Monthly Subscription (Netflix)
```
Type: Expense
Category: Entertainment
Description: Netflix Subscription
Amount: $15.99
Frequency: Monthly
Start Date: 2024-01-15
Auto Generate: ✅ Checked
```
**Result:** Transaction auto-created on the 15th of every month

### Example 2: Salary (Bi-weekly)
```
Type: Income
Category: Salary
Description: Regular Paycheck
Amount: $2,500
Frequency: Bi-weekly
Start Date: 2024-01-05
Auto Generate: ✅ Checked
```
**Result:** Transaction auto-created every 14 days

### Example 3: Quarterly Insurance
```
Type: Expense
Category: Bills & Utilities
Description: Car Insurance Premium
Amount: $450
Frequency: Quarterly
Start Date: 2024-01-01
Auto Generate: ✅ Checked
```
**Result:** Transaction auto-created every 3 months (Jan, Apr, Jul, Oct)

---

## Tips & Best Practices

### 1. Let AI Help You
- Add at least 3 months of transaction history
- Check the "Detected Patterns" tab regularly
- Approve patterns with 70%+ confidence

### 2. Use Descriptive Names
- Good: "Netflix Premium Subscription"
- Bad: "Subscription"
- Helps with organization and future pattern detection

### 3. Pause Instead of Delete
- Temporarily stopped a subscription? Use **Pause**
- Planning to resume later? Keep it paused
- Only delete if permanently cancelled

### 4. Variable Amounts
- System tracks min, max, and average amounts
- Useful for utilities (electricity, water)
- Edit the amount when needed

### 5. Manual Generation
- Use **"Generate Now"** for:
  - Testing new recurring transactions
  - Catching up missed transactions
  - Creating transactions before due date

---

## API Endpoints (For Developers)

```
GET    /api/recurring              - List all recurring transactions
POST   /api/recurring              - Create new recurring transaction
GET    /api/recurring/detect       - Detect patterns from history
POST   /api/recurring/detect/approve - Approve detected pattern
GET    /api/recurring/upcoming     - Get upcoming (next 30 days)
GET    /api/recurring/:id          - Get single transaction
PUT    /api/recurring/:id          - Update recurring transaction
DELETE /api/recurring/:id          - Delete recurring transaction
PATCH  /api/recurring/:id/pause    - Pause recurring transaction
PATCH  /api/recurring/:id/resume   - Resume recurring transaction
POST   /api/recurring/:id/generate - Generate transaction now
GET    /api/recurring/:id/history  - View generation history
POST   /api/recurring/batch/approve - Approve multiple patterns
DELETE /api/recurring/batch/delete - Delete multiple transactions
```

---

## Cron Job Details

**Schedule:** Daily at 00:01 AM
**Action:** Generates due transactions for all active recurring items
**Logs:** Check backend logs for generation summary

**Manual Trigger (Backend):**
```javascript
const { triggerManualGeneration } = require('./jobs/generateRecurring');
await triggerManualGeneration();
```

---

## Troubleshooting

### Pattern Not Detected?
- Ensure you have at least 3 similar transactions
- Check that transactions are within the last 6 months
- Verify amounts are within 5% tolerance
- Descriptions should be similar

### Transaction Not Auto-Generated?
- Check **"Auto Generate"** is enabled
- Verify status is **"Active"** (not Paused)
- Ensure next due date has passed
- Check backend logs for cron job execution

### Confidence Score Too Low?
- Add more historical transactions
- Ensure consistent amounts and intervals
- Check for typos in descriptions

---

## Database Schema

### RecurringTransaction Model
```javascript
{
  userId: ObjectId,
  bankId: ObjectId (optional),
  type: 'income' | 'expense',
  category: String,
  subcategory: String (optional),
  amount: Number,
  description: String,
  
  // Recurring schedule
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly',
  startDate: Date,
  endDate: Date (optional),
  nextDueDate: Date,
  
  // Status
  status: 'active' | 'paused' | 'completed' | 'cancelled',
  autoGenerate: Boolean,
  
  // AI Detection
  isAutoDetected: Boolean,
  detectionSource: 'manual' | 'pattern_detection' | 'amount_matching' | 'description_matching',
  confidenceScore: Number (0-100),
  
  // Variable amounts
  isVariableAmount: Boolean,
  averageAmount: Number,
  minAmount: Number,
  maxAmount: Number,
  
  // Tracking
  lastGenerated: Date,
  generatedCount: Number,
  
  timestamps: true
}
```

---

## Future Enhancements (Roadmap)

- [ ] Calendar view for visual scheduling
- [ ] Email notifications before generation
- [ ] Smart amount predictions for variable recurring
- [ ] Recurring transaction analytics dashboard
- [ ] Import/Export recurring templates
- [ ] Recurring budget allocation
- [ ] Multi-currency support for recurring

---

## Support

For issues or questions:
1. Check backend logs: `/backend/server.log`
2. Check browser console for frontend errors
3. Verify database connection
4. Review API responses in Network tab

---

**Version:** 1.0.0
**Last Updated:** 2026-02-05
**Feature Status:** ✅ Production Ready
