import { useState, useEffect } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import { transactionsAPI, bankAccountsAPI } from '../services/api';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { getCategoriesByType, getCategoryIcon, getCategoryColor } from '../constants/categories';

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
        setFormData(prev => ({ ...prev, bankId: defaultBank }));
      }
    } catch (error) {
    }
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 z-50 flex items-center justify-center"
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
            <label className="label text-lg font-semibold">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl text-gray-500 dark:text-gray-400">
                $
              </span>
              <input
                id="quick-add-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input text-2xl font-bold pl-8"
                placeholder="0.00"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Type Toggle */}
          <div>
            <label className="label">Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  formData.type === 'expense'
                    ? 'bg-danger-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  formData.type === 'income'
                    ? 'bg-success-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Category - Icon Grid for quick selection */}
          <div>
            <label className="label">Category</label>
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
                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-600'
                        : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {Icon && <Icon className="w-6 h-6 mb-1" style={{ color: isSelected ? color : undefined }} />}
                    <span className="text-xs text-center font-medium text-gray-700 dark:text-gray-300">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {!formData.category && (
              <p className="text-xs text-danger-600 dark:text-danger-400 mt-1">
                Please select a category
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="label">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => {
                const method = e.target.value;
                setFormData({ 
                  ...formData, 
                  paymentMethod: method,
                  // Clear bankId if cash is selected
                  bankId: method === 'cash' ? '' : formData.bankId || bankAccounts[0]?._id || ''
                });
              }}
              className="input"
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
              <label className="label">Bank Account</label>
              <select
                value={formData.bankId}
                onChange={(e) => setFormData({ ...formData, bankId: e.target.value })}
                className="input"
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
            <label className="label">Description (Optional)</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              placeholder="e.g., Lunch at restaurant"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={handleClose} className="btn-secondary">
              Close
            </button>
            <button
              type="submit"
              className="btn-primary"
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
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Press Alt+N to open Quick Add from anywhere
          </p>
        </form>
      </Modal>
    </>
  );
};

export default QuickAddTransaction;
