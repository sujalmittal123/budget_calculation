import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiX } from 'react-icons/fi';
import { getCategoriesByType, getCategoryColor, getCategoryIcon } from '../constants/categories';
import { bankAccountsAPI, transactionsAPI } from '../services/api';
import Modal from './Modal';

const QuickAddTransaction = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [lastUsedBank, setLastUsedBank] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    bankId: '',
    description: '',
    type: 'expense',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'card',
  });

  useEffect(() => {
    fetchBankAccounts();

    // Keyboard shortcut: Alt+N
    const handleKeyPress = (e) => {
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const response = await bankAccountsAPI.getAll();
      const accounts = response.data.data;
      setBankAccounts(accounts);

      // Set default bank to first account or last used
      if (accounts.length > 0) {
        const defaultBank = lastUsedBank || accounts[0]._id;
        setFormData((prev) => ({ ...prev, bankId: defaultBank }));
      }
    } catch (error) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await transactionsAPI.create(formData);
      toast.success('Transaction added!');

      // Remember last used bank
      setLastUsedBank(formData.bankId);

      // Reset form but keep bank selection
      setFormData({
        amount: '',
        category: '',
        bankId: formData.bankId,
        description: '',
        type: 'expense',
        date: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: 'card',
      });

      // Keep modal open for next transaction
      // Focus on amount field for quick entry
      setTimeout(() => {
        document.getElementById('quick-add-amount')?.focus();
      }, 100);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add transaction');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form when closing
    setFormData({
      amount: '',
      category: '',
      bankId: lastUsedBank || bankAccounts[0]?._id || '',
      description: '',
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'card',
    });
  };

  const categories = getCategoriesByType(formData.type);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 z-50 flex items-center justify-center"
        title="Quick Add Transaction (Alt+N)"
        aria-label="Quick Add Transaction"
      >
        <FiPlus className="w-6 h-6" />
      </button>

      {/* Quick Add Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} title="Quick Add Transaction" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount - Large and prominent */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5 text-lg font-semibold">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl text-muted-foreground">
                $
              </span>
              <input
                id="quick-add-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2.5 border border-input rounded-lg bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring text-2xl font-bold pl-8"
                placeholder="0.00"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${ formData.type === 'expense' ? 'bg-destructive text-white' : 'bg-background text-foreground hover:bg-muted ' }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${ formData.type === 'income' ? 'bg-chart-2 text-white' : 'bg-background text-foreground hover:bg-muted ' }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Category - Icon Grid for quick selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.value);
                const color = getCategoryColor(cat.value);
                const isSelected = formData.category === cat.value;

                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${ isSelected ? 'bg-primary/10 border-2 border-primary' : 'bg-background border-2 border-transparent hover:border-border ' }`}
                  >
                    {Icon && (
                      <Icon
                        className="w-6 h-6 mb-1"
                        style={{ color: isSelected ? color : undefined }}
                      />
                    )}
                    <span className="text-xs text-center font-medium text-foreground">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {!formData.category && (
              <p className="text-xs text-destructive mt-1">
                Please select a category
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => {
                const method = e.target.value;
                setFormData({
                  ...formData,
                  paymentMethod: method,
                  // Clear bankId if cash is selected
                  bankId: method === 'cash' ? '' : formData.bankId || bankAccounts[0]?._id || '',
                });
              }}
              className="w-full px-4 py-2.5 border border-input rounded-lg bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
            >
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Bank Account - Only show if not cash */}
          {formData.paymentMethod !== 'cash' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Bank Account</label>
              <select
                value={formData.bankId}
                onChange={(e) => setFormData({ ...formData, bankId: e.target.value })}
                className="w-full px-4 py-2.5 border border-input rounded-lg bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Select Account</option>
                {bankAccounts.map((bank) => (
                  <option key={bank._id} value={bank._id}>
                    {bank.bankName} ({bank.accountNumber})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description (Optional) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description (Optional)</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-input rounded-lg bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              placeholder="e.g., Lunch at restaurant"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-3 pt-4 border-t border-border">
            <button type="button" onClick={handleClose} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg font-medium">
              Close
            </button>
            <button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium"
              disabled={
                !formData.amount ||
                !formData.category ||
                (formData.paymentMethod !== 'cash' && !formData.bankId)
              }
            >
              Add & Continue
            </button>
          </div>

          {/* Hint */}
          <p className="text-xs text-center text-muted-foreground">
            Press Alt+N to open Quick Add from anywhere
          </p>
        </form>
      </Modal>
    </>
  );
};

export default QuickAddTransaction;
