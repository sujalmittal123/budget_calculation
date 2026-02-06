import { useState, useEffect } from 'react';
import { 
  FiRepeat, FiPlus, FiPause, FiPlay, FiTrash2, FiEdit2, 
  FiZap, FiCalendar, FiCheck, FiX, FiTrendingUp, FiClock,
  FiDollarSign, FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { recurringAPI } from '../services/api';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants/categories';
import { format, parseISO, addDays, addWeeks, addMonths, addYears, isAfter, isBefore } from 'date-fns';
import { formatCurrency as formatCurrencyUtil } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';

const RecurringTransactions = () => {
  const { user } = useAuth();
  const userCurrency = user?.preferences?.currency || 'USD';
  const [recurring, setRecurring] = useState([]);
  const [detectedPatterns, setDetectedPatterns] = useState([]);
  const [upcomingTransactions, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active, detected, upcoming
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const formatCurrency = (value) => formatCurrencyUtil(value, userCurrency);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recurringRes, patternsRes, upcomingRes] = await Promise.all([
        recurringAPI.getAll({ status: 'active' }),
        recurringAPI.detect(),
        recurringAPI.getUpcoming(30)
      ]);

      setRecurring(recurringRes.data.data || []);
      setDetectedPatterns(patternsRes.data.data || []);
      setUpcoming(upcomingRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load recurring transactions');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (id) => {
    try {
      await recurringAPI.pause(id);
      toast.success('Recurring transaction paused');
      fetchData();
    } catch (error) {
      toast.error('Failed to pause transaction');
    }
  };

  const handleResume = async (id) => {
    try {
      await recurringAPI.resume(id);
      toast.success('Recurring transaction resumed');
      fetchData();
    } catch (error) {
      toast.error('Failed to resume transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) return;
    
    try {
      await recurringAPI.delete(id);
      toast.success('Recurring transaction deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleGenerateNow = async (id) => {
    try {
      await recurringAPI.generateNow(id);
      toast.success('Transaction generated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to generate transaction');
    }
  };

  const handleApprovePattern = async (pattern) => {
    try {
      await recurringAPI.approvePattern(pattern);
      toast.success('Pattern approved and recurring transaction created');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve pattern');
    }
  };

  const handleBatchApprove = async () => {
    if (detectedPatterns.length === 0) return;
    
    try {
      await recurringAPI.batchApprove(detectedPatterns);
      toast.success(`Approved ${detectedPatterns.length} pattern(s)`);
      fetchData();
    } catch (error) {
      toast.error('Failed to approve patterns');
    }
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      biweekly: 'Bi-weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly'
    };
    return labels[frequency] || frequency;
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiRepeat className="text-primary-600" />
            Recurring Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your recurring income and expenses with AI-powered detection
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Recurring</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Active"
          value={recurring.filter(r => r.status === 'active').length}
          icon={FiRepeat}
          gradient="from-emerald-500 to-teal-500"
        />
        <StatCard
          title="Paused"
          value={recurring.filter(r => r.status === 'paused').length}
          icon={FiPause}
          gradient="from-amber-500 to-orange-500"
        />
        <StatCard
          title="Detected Patterns"
          value={detectedPatterns.length}
          icon={FiZap}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Upcoming (30 days)"
          value={upcomingTransactions.length}
          icon={FiCalendar}
          gradient="from-blue-500 to-indigo-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <TabButton
          active={activeTab === 'active'}
          onClick={() => setActiveTab('active')}
          label="Active"
          count={recurring.length}
        />
        <TabButton
          active={activeTab === 'detected'}
          onClick={() => setActiveTab('detected')}
          label="Detected Patterns"
          count={detectedPatterns.length}
          badge={detectedPatterns.length > 0}
        />
        <TabButton
          active={activeTab === 'upcoming'}
          onClick={() => setActiveTab('upcoming')}
          label="Upcoming"
          count={upcomingTransactions.length}
        />
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'active' && (
          <ActiveRecurring
            items={recurring}
            onPause={handlePause}
            onResume={handleResume}
            onDelete={handleDelete}
            onEdit={(item) => {
              setEditingItem(item);
              setShowModal(true);
            }}
            onGenerateNow={handleGenerateNow}
            getFrequencyLabel={getFrequencyLabel}
          />
        )}

        {activeTab === 'detected' && (
          <DetectedPatterns
            patterns={detectedPatterns}
            onApprove={handleApprovePattern}
            onApproveAll={handleBatchApprove}
            getFrequencyLabel={getFrequencyLabel}
            getConfidenceColor={getConfidenceColor}
          />
        )}

        {activeTab === 'upcoming' && (
          <UpcomingTransactions
            items={upcomingTransactions}
            getFrequencyLabel={getFrequencyLabel}
          />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <RecurringModal
          item={editingItem}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          onSave={() => {
            fetchData();
            setShowModal(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, gradient }) => (
  <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <Icon className="w-6 h-6 text-white/60" />
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  </div>
);

// Tab Button Component
const TabButton = ({ active, onClick, label, count, badge }) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-3 font-medium transition-all duration-300 ${
      active
        ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
    }`}
  >
    {label} <span className="text-sm">({count})</span>
    {badge && (
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
    )}
  </button>
);

// Active Recurring Component
const ActiveRecurring = ({ items, onPause, onResume, onDelete, onEdit, onGenerateNow, getFrequencyLabel }) => {
  const { user } = useAuth();
  const userCurrency = user?.preferences?.currency || 'USD';
  const formatCurrency = (value) => formatCurrencyUtil(value, userCurrency);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <FiRepeat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg">No active recurring transactions</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
          Click "Add Recurring" to create one or check detected patterns
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((item) => (
        <div
          key={item._id}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-2xl ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {item.type === 'income' ? '↑' : '↓'}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.description}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.category} {item.subcategory && `• ${item.subcategory}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <FiDollarSign className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.amount)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FiRepeat className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getFrequencyLabel(item.frequency)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Next: {format(parseISO(item.nextDueDate), 'MMM dd, yyyy')}
                  </span>
                </div>

                {item.isAutoDetected && (
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full flex items-center gap-1">
                    <FiZap className="w-3 h-3" />
                    AI Detected
                  </span>
                )}

                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.status === 'active' 
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {item.status === 'active' ? (
                <button
                  onClick={() => onPause(item._id)}
                  className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                  title="Pause"
                >
                  <FiPause className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => onResume(item._id)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                  title="Resume"
                >
                  <FiPlay className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={() => onGenerateNow(item._id)}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Generate Now"
              >
                <FiZap className="w-5 h-5" />
              </button>

              <button
                onClick={() => onEdit(item)}
                className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Edit"
              >
                <FiEdit2 className="w-5 h-5" />
              </button>

              <button
                onClick={() => onDelete(item._id)}
                className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                title="Delete"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Detected Patterns Component
const DetectedPatterns = ({ patterns, onApprove, onApproveAll, getFrequencyLabel, getConfidenceColor }) => {
  const { user } = useAuth();
  const userCurrency = user?.preferences?.currency || 'USD';
  const formatCurrency = (value) => formatCurrencyUtil(value, userCurrency);

  if (patterns.length === 0) {
    return (
      <div className="text-center py-12">
        <FiZap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg">No patterns detected</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
          Add more transactions to enable AI pattern detection
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          AI detected {patterns.length} potential recurring transaction(s)
        </p>
        {patterns.length > 0 && (
          <button
            onClick={onApproveAll}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <FiCheck className="w-4 h-4" />
            Approve All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {patterns.map((pattern, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 shadow-md border-2 border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <FiZap className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {pattern.description}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {pattern.category}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(pattern.amount)}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      • {getFrequencyLabel(pattern.frequency)}
                    </span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(pattern.confidenceScore)}`}>
                    {pattern.confidenceScore}% Confidence
                  </span>

                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Based on {pattern.occurrences} transaction(s)
                  </span>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Detection: {pattern.detectionSource.replace('_', ' ')}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onApprove(pattern)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <FiCheck className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Upcoming Transactions Component
const UpcomingTransactions = ({ items, getFrequencyLabel }) => {
  const { user } = useAuth();
  const userCurrency = user?.preferences?.currency || 'USD';
  const formatCurrency = (value) => formatCurrencyUtil(value, userCurrency);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-lg">No upcoming transactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item._id}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              item.type === 'income' 
                ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600' 
                : 'bg-rose-100 dark:bg-rose-900 text-rose-600'
            }`}>
              <span className="text-xl">{item.type === 'income' ? '↑' : '↓'}</span>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{item.description}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getFrequencyLabel(item.frequency)} • {item.category}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(item.amount)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {format(parseISO(item.nextDueDate), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Recurring Modal Component (Simplified - would need full implementation)
const RecurringModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState(item || {
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    autoGenerate: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (item) {
        await recurringAPI.update(item._id, formData);
        toast.success('Recurring transaction updated');
      } else {
        await recurringAPI.create(formData);
        toast.success('Recurring transaction created');
      }
      onSave();
    } catch (error) {
      toast.error('Failed to save recurring transaction');
    }
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {item ? 'Edit' : 'Create'} Recurring Transaction
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                  formData.type === 'income'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                  formData.type === 'expense'
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Netflix Subscription"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
              placeholder="0.00"
              required
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frequency
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {/* Auto Generate */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoGenerate"
              checked={formData.autoGenerate}
              onChange={(e) => setFormData({ ...formData, autoGenerate: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="autoGenerate" className="text-sm text-gray-700 dark:text-gray-300">
              Automatically generate transactions
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all"
            >
              {item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringTransactions;
