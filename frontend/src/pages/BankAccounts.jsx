import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCreditCard, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { bankAccountsAPI, dashboardAPI } from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#6366F1'];

const BankAccounts = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankSummary, setBankSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountType: 'savings',
    initialBalance: '',
    currency: 'USD',
    color: COLORS[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountsRes, summaryRes] = await Promise.all([
        bankAccountsAPI.getAll(),
        dashboardAPI.getBankSummary(),
      ]);
      setBankAccounts(accountsRes.data.data);
      setBankSummary(summaryRes.data.data);
    } catch (error) {
      toast.error('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        initialBalance: parseFloat(formData.initialBalance) || 0,
      };

      if (editingAccount) {
        await bankAccountsAPI.update(editingAccount._id, payload);
        toast.success('Bank account updated');
      } else {
        await bankAccountsAPI.create(payload);
        toast.success('Bank account added');
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save bank account');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) return;
    
    try {
      await bankAccountsAPI.delete(id);
      toast.success('Bank account deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete bank account');
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      initialBalance: account.initialBalance.toString(),
      currency: account.currency,
      color: account.color,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
    setFormData({
      bankName: '',
      accountNumber: '',
      accountType: 'savings',
      initialBalance: '',
      currency: 'USD',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getSummaryForAccount = (accountId) => {
    return bankSummary.find(s => s.id === accountId) || {};
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Bank Accounts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your bank accounts and track balances
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Bank Account
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="card p-6 bg-gradient-to-r from-primary-600 to-primary-700">
        <p className="text-primary-100 text-sm font-medium">Total Balance Across All Accounts</p>
        <p className="text-3xl md:text-4xl font-bold text-white mt-2">
          {formatCurrency(bankAccounts.reduce((sum, acc) => sum + acc.balance, 0))}
        </p>
        <p className="text-primary-200 text-sm mt-2">
          {bankAccounts.length} account{bankAccounts.length !== 1 ? 's' : ''} linked
        </p>
      </div>

      {/* Bank Accounts Grid */}
      {bankAccounts.length === 0 ? (
        <div className="card p-12 text-center">
          <FiCreditCard className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Bank Accounts Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Add your first bank account to start tracking your finances.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            Add Bank Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bankAccounts.map((account) => {
            const summary = getSummaryForAccount(account._id);
            return (
              <div key={account._id} className="card overflow-hidden">
                {/* Card Header */}
                <div
                  className="p-4"
                  style={{ backgroundColor: account.color + '15' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: account.color + '30' }}
                      >
                        <FiCreditCard style={{ color: account.color }} className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {account.bankName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {account.accountNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(account)}
                        className="p-2 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(account._id)}
                        className="p-2 hover:bg-danger-100/50 dark:hover:bg-danger-500/10 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4 text-danger-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(account.balance)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-success-100 dark:bg-success-500/20 rounded-lg flex items-center justify-center">
                        <FiTrendingUp className="w-4 h-4 text-success-600 dark:text-success-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Income</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(summary.totalIncome || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-danger-100 dark:bg-danger-500/20 rounded-lg flex items-center justify-center">
                        <FiTrendingDown className="w-4 h-4 text-danger-600 dark:text-danger-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Expense</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(summary.totalExpense || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Account Type</span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {account.accountType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-500 dark:text-gray-400">Transactions</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {summary.transactionCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Bank Name</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className="input"
              placeholder="e.g., Chase, Bank of America"
              required
            />
          </div>

          <div>
            <label className="label">Account Number</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              className="input"
              placeholder="Enter account number"
              required
              disabled={!!editingAccount}
            />
            <p className="text-xs text-gray-500 mt-1">
              Account number will be masked for security
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Account Type</label>
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                className="input"
              >
                <option value="savings">Savings</option>
                <option value="checking">Checking</option>
                <option value="credit">Credit Card</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div>
              <label className="label">Initial Balance</label>
              <input
                type="number"
                step="0.01"
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                className="input"
                placeholder="0.00"
                disabled={!!editingAccount}
              />
            </div>
          </div>

          <div>
            <label className="label">Card Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingAccount ? 'Update' : 'Add'} Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BankAccounts;
