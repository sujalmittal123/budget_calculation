import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiCreditCard,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiTrendingDown,
  FiTrendingUp,
} from 'react-icons/fi';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { bankAccountsAPI, dashboardAPI } from '../services/api';
import { formatCurrency as formatCurrencyUtil } from '../utils/currency';

const COLORS = [
  '#3B82F6',
  '#8B5CF6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#06B6D4',
  '#6366F1',
];

const BankAccounts = () => {
  const { user } = useAuth();
  const userCurrency = user?.preferences?.currency || 'USD';
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

  const formatCurrency = (value) => formatCurrencyUtil(value, userCurrency);

  const getSummaryForAccount = (accountId) => {
    return bankSummary.find((s) => s.id === accountId) || {};
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Bank Accounts
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your bank accounts and track balances
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Bank Account
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 bg-gradient-to-r from-primary-600 to-primary-700">
        <p className="text-primary/70 text-sm font-medium">Total Balance Across All Accounts</p>
        <p className="text-3xl md:text-4xl font-bold text-white mt-2">
          {formatCurrency(bankAccounts.reduce((sum, acc) => sum + acc.balance, 0))}
        </p>
        <p className="text-primary/60 text-sm mt-2">
          {bankAccounts.length} account{bankAccounts.length !== 1 ? 's' : ''} linked
        </p>
      </div>

      {/* Bank Accounts Grid */}
      {bankAccounts.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
          <FiCreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Bank Accounts Yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Add your first bank account to start tracking your finances.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium">
            Add Bank Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bankAccounts.map((account) => {
            const summary = getSummaryForAccount(account._id);
            return (
              <div key={account._id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                {/* Card Header */}
                <div className="p-4" style={{ backgroundColor: account.color + '15' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: account.color + '30' }}
                      >
                        <FiCreditCard style={{ color: account.color }} className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {account.bankName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {account.accountNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(account)}
                        className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDelete(account._id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(account.balance)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-chart-2/10 rounded-lg flex items-center justify-center">
                        <FiTrendingUp className="w-4 h-4 text-chart-2" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Income</p>
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(summary.totalIncome || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                        <FiTrendingDown className="w-4 h-4 text-destructive" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Expense</p>
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(summary.totalExpense || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Account Type</span>
                      <span className="font-medium text-foreground capitalize">
                        {account.accountType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Transactions</span>
                      <span className="font-medium text-foreground">
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
            <label className="block text-sm font-medium text-foreground mb-1.5">Bank Name</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className="w-full px-4 py-2.5 border border-input rounded-lg bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              placeholder="e.g., Chase, Bank of America"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Account Number</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              className="w-full px-4 py-2.5 border border-input rounded-lg bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              placeholder="Enter account number"
              required
              disabled={!!editingAccount}
            />
            <p className="text-xs text-muted-foreground mt-1">Account number will be masked for security</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Account Type</label>
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                className="w-full px-4 py-2.5 border border-input rounded-lg bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                <option value="savings">Savings</option>
                <option value="checking">Checking</option>
                <option value="credit">Credit Card</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Initial Balance</label>
              <input
                type="number"
                step="0.01"
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                className="w-full px-4 py-2.5 border border-input rounded-lg bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                placeholder="0.00"
                disabled={!!editingAccount}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Card Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full transition-transform ${ formData.color === color ? 'ring-2 ring-offset-2 ring-ring scale-110' : '' }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg font-medium">
              Cancel
            </button>
            <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium">
              {editingAccount ? 'Update' : 'Add'} Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BankAccounts;
