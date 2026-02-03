import { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiFilter,
  FiDownload,
  FiUpload,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { format } from 'date-fns';
import { transactionsAPI, bankAccountsAPI, exportAPI } from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  // Filter state
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    type: '',
    bankId: '',
    search: '',
  });

  // Form state
  const [formData, setFormData] = useState({
    bankId: '',
    type: 'expense',
    category: 'personal',
    amount: '',
    description: '',
    paymentMethod: 'card',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchBankAccounts();
    fetchTransactions();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const response = await bankAccountsAPI.getAll();
      setBankAccounts(response.data.data);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 15, ...filters };
      // Remove empty filters
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      
      const response = await transactionsAPI.getAll(params);
      setTransactions(response.data.data);
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total,
      });
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await transactionsAPI.update(editingTransaction._id, formData);
        toast.success('Transaction updated successfully');
      } else {
        await transactionsAPI.create(formData);
        toast.success('Transaction added successfully');
      }
      closeModal();
      fetchTransactions(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await transactionsAPI.delete(id);
      toast.success('Transaction deleted');
      fetchTransactions(pagination.page);
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      bankId: transaction.bankId?._id || transaction.bankId,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description || '',
      paymentMethod: transaction.paymentMethod,
      date: format(new Date(transaction.date), 'yyyy-MM-dd'),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setFormData({
      bankId: bankAccounts[0]?._id || '',
      type: 'expense',
      category: 'personal',
      amount: '',
      description: '',
      paymentMethod: 'card',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const applyFilters = () => {
    fetchTransactions(1);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: '',
      type: '',
      bankId: '',
      search: '',
    });
    fetchTransactions(1);
    setIsFilterOpen(false);
  };

  const handleExportCSV = async () => {
    try {
      const response = await exportAPI.transactionsCSV(filters);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Transactions exported successfully');
    } catch (error) {
      toast.error('Failed to export transactions');
    }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('bankId', formData.bankId);

    try {
      const response = await transactionsAPI.importCSV(formDataUpload);
      toast.success(`Imported ${response.data.imported} transactions`);
      if (response.data.errors > 0) {
        toast.error(`${response.data.errors} rows had errors`);
      }
      setIsImportOpen(false);
      fetchTransactions(1);
    } catch (error) {
      toast.error('Failed to import CSV');
    }
    e.target.value = '';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your income and expenses
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <button
            onClick={handleExportCSV}
            className="btn-secondary flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <FiUpload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => {
              setFormData(prev => ({ ...prev, bankId: bankAccounts[0]?._id || '' }));
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          onKeyPress={(e) => e.key === 'Enter' && fetchTransactions(1)}
          className="input pl-10"
        />
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Bank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        <div className="max-w-xs truncate">
                          {transaction.description || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`badge-${transaction.category}`}>
                            {transaction.category}
                          </span>
                          <span className={`badge-${transaction.type}`}>
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {transaction.bankId?.bankName || '-'}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                        transaction.type === 'income' 
                          ? 'text-success-600 dark:text-success-400' 
                          : 'text-danger-600 dark:text-danger-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            className="p-1.5 text-gray-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {transactions.length} of {pagination.total} transactions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchTransactions(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => fetchTransactions(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                <option value="personal">Personal</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Bank Account</label>
            <select
              value={formData.bankId}
              onChange={(e) => setFormData({ ...formData, bankId: e.target.value })}
              className="input"
              required
            >
              <option value="">Select Bank Account</option>
              {bankAccounts.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {bank.bankName} ({bank.accountNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
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

          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows="3"
              placeholder="Enter description..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingTransaction ? 'Update' : 'Add'} Transaction
            </button>
          </div>
        </form>
      </Modal>

      {/* Filter Modal */}
      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Transactions">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input"
            >
              <option value="">All Categories</option>
              <option value="personal">Personal</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div>
            <label className="label">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="input"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="label">Bank Account</label>
            <select
              value={filters.bankId}
              onChange={(e) => setFilters({ ...filters, bankId: e.target.value })}
              className="input"
            >
              <option value="">All Accounts</option>
              {bankAccounts.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {bank.bankName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between pt-4">
            <button type="button" onClick={clearFilters} className="btn-secondary">
              Clear Filters
            </button>
            <button type="button" onClick={applyFilters} className="btn-primary">
              Apply Filters
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} title="Import Transactions from CSV">
        <div className="space-y-4">
          <div>
            <label className="label">Select Bank Account</label>
            <select
              value={formData.bankId}
              onChange={(e) => setFormData({ ...formData, bankId: e.target.value })}
              className="input"
              required
            >
              <option value="">Select Bank Account</option>
              {bankAccounts.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {bank.bankName}
                </option>
              ))}
            </select>
          </div>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <FiUpload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Upload a CSV file with columns:
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              date, type, category, amount, description, paymentMethod
            </p>
            <label className="btn-primary cursor-pointer inline-block">
              Choose File
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
                disabled={!formData.bankId}
              />
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Transactions;
