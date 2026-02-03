import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCreditCard,
  FiAlertCircle,
  FiArrowRight,
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [bankSummary, setBankSummary] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, categoryRes, trendRes, bankRes, recentRes] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getCategoryBreakdown(),
        dashboardAPI.getMonthlyTrend(),
        dashboardAPI.getBankSummary(),
        dashboardAPI.getRecentTransactions(5),
      ]);

      setSummary(summaryRes.data.data);
      setCategoryBreakdown(categoryRes.data.data);
      setMonthlyTrend(trendRes.data.data);
      setBankSummary(bankRes.data.data);
      setRecentTransactions(recentRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's your financial overview for this month
          </p>
        </div>
      </div>

      {/* Budget Alert */}
      {summary?.isOverBudget && (
        <div className="bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/30 rounded-xl p-4 flex items-center gap-3">
          <FiAlertCircle className="w-6 h-6 text-danger-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-danger-600 dark:text-danger-400">
              You've exceeded your monthly budget!
            </p>
            <p className="text-sm text-danger-500 dark:text-danger-400/80">
              You've spent {formatCurrency(summary.monthly.expense)} out of your{' '}
              {formatCurrency(summary.budgetLimit)} budget limit.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Monthly Income
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(summary?.monthly?.income || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 dark:bg-success-500/20 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Monthly Expenses
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(summary?.monthly?.expense || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-danger-100 dark:bg-danger-500/20 rounded-xl flex items-center justify-center">
              <FiTrendingDown className="w-6 h-6 text-danger-600 dark:text-danger-400" />
            </div>
          </div>
          {summary?.budgetLimit > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Budget Usage</span>
                <span className={summary?.isOverBudget ? 'text-danger-500' : 'text-gray-500'}>
                  {summary?.budgetUsedPercent}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    summary?.isOverBudget ? 'bg-danger-500' : 'bg-primary-500'
                  }`}
                  style={{ width: `${Math.min(summary?.budgetUsedPercent || 0, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Balance Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Monthly Balance
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                (summary?.monthly?.balance || 0) >= 0 
                  ? 'text-success-600 dark:text-success-400' 
                  : 'text-danger-600 dark:text-danger-400'
              }`}>
                {formatCurrency(summary?.monthly?.balance || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-500/20 rounded-xl flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        {/* Total Bank Balance Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Bank Balance
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(summary?.totalBankBalance || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-xl flex items-center justify-center">
              <FiCreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Income vs Expense Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="monthName" 
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  name="Expense"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Expense by Category
          </h3>
          <div className="h-72">
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="category"
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                No expense data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bank Accounts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank Accounts Summary */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Bank Accounts
            </h3>
            <Link
              to="/bank-accounts"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="space-y-3">
            {bankSummary.length > 0 ? (
              bankSummary.slice(0, 4).map((bank) => (
                <div
                  key={bank.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: bank.color + '20' }}
                    >
                      <FiCreditCard style={{ color: bank.color }} className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {bank.bankName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {bank.maskedAccountNumber}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(bank.balance)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <FiCreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No bank accounts added</p>
                <Link
                  to="/bank-accounts"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Add your first account
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </h3>
            <Link
              to="/transactions"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === 'income'
                          ? 'bg-success-100 dark:bg-success-500/20'
                          : 'bg-danger-100 dark:bg-danger-500/20'
                      }`}
                    >
                      {transaction.type === 'income' ? (
                        <FiTrendingUp className="w-5 h-5 text-success-600 dark:text-success-400" />
                      ) : (
                        <FiTrendingDown className="w-5 h-5 text-danger-600 dark:text-danger-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                        {transaction.description || transaction.category}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      transaction.type === 'income'
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-danger-600 dark:text-danger-400'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <FiDollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No transactions yet</p>
                <Link
                  to="/transactions"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Add your first transaction
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Comparison Bar Chart */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Comparison
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="monthName" 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
