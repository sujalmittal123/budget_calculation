const express = require('express');
const PDFDocument = require('pdfkit');
const router = express.Router();
const Transaction = require('../models/Transaction');
const BankAccount = require('../models/BankAccount');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/export/transactions/csv
// @desc    Export transactions as CSV
// @access  Private
router.get('/transactions/csv', async (req, res) => {
  try {
    const { startDate, endDate, category, type, bankId } = req.query;

    // Build query
    const queryObj = { userId: req.user.id };

    if (startDate || endDate) {
      queryObj.date = {};
      if (startDate) queryObj.date.$gte = new Date(startDate);
      if (endDate) queryObj.date.$lte = new Date(endDate);
    }

    if (category) queryObj.category = category;
    if (type) queryObj.type = type;
    if (bankId) queryObj.bankId = bankId;

    const transactions = await Transaction.find(queryObj)
      .populate('bankId', 'bankName')
      .sort({ date: -1 });

    // Create CSV content
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Payment Method', 'Bank Account'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category,
      t.amount.toFixed(2),
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.paymentMethod,
      t.bankId?.bankName || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting transactions',
      error: error.message
    });
  }
});

// @route   GET /api/export/report/pdf
// @desc    Export monthly report as PDF
// @access  Private
router.get('/report/pdf', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const now = new Date();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const targetYear = parseInt(year) || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Get transactions
    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).populate('bankId', 'bankName').sort({ date: -1 });

    // Calculate summary
    const summary = transactions.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });

    // Get bank accounts
    const bankAccounts = await BankAccount.find({
      userId: req.user.id,
      isActive: true
    });

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=budget-report-${targetMonth}-${targetYear}.pdf`);

    doc.pipe(res);

    // Title
    doc.fontSize(24).font('Helvetica-Bold').text('Budget Report', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text(
      `${new Date(targetYear, targetMonth - 1).toLocaleString('default', { month: 'long' })} ${targetYear}`,
      { align: 'center' }
    );
    doc.moveDown(2);

    // Summary Section
    doc.fontSize(18).font('Helvetica-Bold').text('Summary');
    doc.moveDown(0.5);
    
    doc.fontSize(12).font('Helvetica');
    doc.text(`Total Income: $${summary.income.toFixed(2)}`, { continued: false });
    doc.text(`Total Expenses: $${summary.expense.toFixed(2)}`);
    doc.text(`Net Balance: $${(summary.income - summary.expense).toFixed(2)}`);
    doc.moveDown(1.5);

    // Bank Accounts Section
    doc.fontSize(18).font('Helvetica-Bold').text('Bank Accounts');
    doc.moveDown(0.5);
    
    doc.fontSize(12).font('Helvetica');
    bankAccounts.forEach(bank => {
      doc.text(`${bank.bankName} (${bank.accountType}): $${bank.balance.toFixed(2)}`);
    });
    doc.moveDown(1.5);

    // Category Breakdown
    const categoryTotals = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    doc.fontSize(18).font('Helvetica-Bold').text('Expenses by Category');
    doc.moveDown(0.5);
    
    doc.fontSize(12).font('Helvetica');
    Object.entries(categoryTotals).forEach(([category, total]) => {
      doc.text(`${category.charAt(0).toUpperCase() + category.slice(1)}: $${total.toFixed(2)}`);
    });
    doc.moveDown(1.5);

    // Transactions List
    doc.fontSize(18).font('Helvetica-Bold').text('Transactions');
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    const tableHeaders = ['Date', 'Type', 'Category', 'Amount', 'Description'];
    const colWidths = [70, 60, 70, 70, 200];
    let xPos = 50;

    doc.fontSize(10).font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
      doc.text(header, xPos, tableTop, { width: colWidths[i] });
      xPos += colWidths[i];
    });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Table rows
    doc.font('Helvetica').fontSize(9);
    transactions.slice(0, 30).forEach(t => {
      if (doc.y > 700) {
        doc.addPage();
      }
      
      xPos = 50;
      const rowY = doc.y;
      
      doc.text(new Date(t.date).toLocaleDateString(), xPos, rowY, { width: colWidths[0] });
      xPos += colWidths[0];
      doc.text(t.type, xPos, rowY, { width: colWidths[1] });
      xPos += colWidths[1];
      doc.text(t.category, xPos, rowY, { width: colWidths[2] });
      xPos += colWidths[2];
      doc.text(`$${t.amount.toFixed(2)}`, xPos, rowY, { width: colWidths[3] });
      xPos += colWidths[3];
      doc.text((t.description || '').substring(0, 30), xPos, rowY, { width: colWidths[4] });
      
      doc.moveDown(0.5);
    });

    if (transactions.length > 30) {
      doc.moveDown(1);
      doc.text(`... and ${transactions.length - 30} more transactions`);
    }

    // Footer
    doc.fontSize(8).text(
      `Generated on ${new Date().toLocaleString()}`,
      50, 750, { align: 'center' }
    );

    doc.end();
  } catch (error) {
    console.error('PDF Export Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF report',
      error: error.message
    });
  }
});

module.exports = router;
