import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCreditCard,
  FiAlertCircle,
  FiArrowRight,
  FiActivity,
  FiPieChart,
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
import { dashboardAPI, dailyNotesAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import SkeletonLoader from '../components/SkeletonLoader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { getCategoryColor } from '../constants/categories';
import { formatCurrency as formatCurrencyUtil } from '../utils/currency';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [summary, setSummary] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [bankSummary, setBankSummary] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [burnRate, setBurnRate] = useState(null);

  const userCurrency = user?.preferences?.currency || 'USD';

  useEffect(() => {
    // Prevent multiple fetches
    if (dataFetched) {
      return;
    }
    
    let mounted = true;
    
    const loadData = async () => {
      if (mounted && !dataFetched) {
        await fetchDashboardData();
        setDataFetched(true);
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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
      
      
      // Try to fetch burn rate, but don't fail if it doesn't exist
      try {
        const burnRateRes = await dailyNotesAPI.getBurnRate();
        setBurnRate(burnRateRes.data.data);
      } catch (error) {
        setBurnRate(null);
      }
      
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader type="gradientCard" count={4} />
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader type="chart" count={2} />
        </div>

        {/* Lists Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4 animate-pulse"></div>
            <SkeletonLoader type="list" count={4} />
          </div>
          <div className="card p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4 animate-pulse"></div>
            <SkeletonLoader type="list" count={4} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}! <span className="inline-block animate-wiggle">👋</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's your financial overview for this month
          </p>
        </div>
      </div>

      {/* Budget Alert */}
      {summary?.isOverBudget && (
        <div className="bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/30 rounded-xl p-4 flex items-center gap-3 animate-bounce-in">
          <FiAlertCircle className="w-6 h-6 text-danger-500 flex-shrink-0 animate-pulse" />
          <div>
            <p className="font-medium text-danger-600 dark:text-danger-400">
              You've exceeded your monthly budget!
            </p>
            <p className="text-sm text-danger-500 dark:text-danger-400/80">
              You've spent {formatCurrencyUtil(summary.monthly.expense, userCurrency)} out of your{' '}
              {formatCurrencyUtil(summary.budgetLimit, userCurrency)} budget limit.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-stagger">
        {/* Income Card - Gradient Style */}
        <div className="relative group overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform-gpu">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 animate-float"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-emerald-50 text-sm font-semibold mb-2 uppercase tracking-wide">Monthly Income</p>
              <p className="text-4xl font-bold text-white mb-2">{formatCurrencyUtil(summary?.monthly?.income || 0, userCurrency)}</p>
              
              {/* Trend Indicator */}
              <div className="flex items-center gap-1 text-emerald-50 text-sm font-medium">
                <FiTrendingUp className="w-4 h-4" />
                <span>Healthy cash flow</span>
              </div>
            </div>
            
            {/* Animated Icon */}
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <FiTrendingUp className="w-8 h-8 text-white animate-float" />
            </div>
          </div>
        </div>

        {/* Expense Card - Gradient Style */}
        <div className="relative group overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-rose-400 to-rose-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform-gpu">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 animate-float-slow"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-rose-50 text-sm font-semibold mb-2 uppercase tracking-wide">Monthly Expenses</p>
                <p className="text-4xl font-bold text-white mb-2">{formatCurrencyUtil(summary?.monthly?.expense || 0, userCurrency)}</p>
              </div>
              
              {/* Animated Icon */}
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                <FiTrendingDown className="w-8 h-8 text-white animate-float" />
              </div>
            </div>
            
            {/* Budget Progress Bar */}
            {summary?.budgetLimit > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-2 text-rose-50 font-medium">
                  <span>Budget Usage</span>
                  <span className={summary?.isOverBudget ? 'font-bold' : ''}>
                    {summary?.budgetUsedPercent}%
                  </span>
                </div>
                <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
                      summary?.isOverBudget ? 'bg-white animate-pulse' : 'bg-white/90'
                    }`}
                    style={{ width: `${Math.min(summary?.budgetUsedPercent || 0, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Balance Card - Gradient Style */}
        <div className={`relative group overflow-hidden rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform-gpu ${
          (summary?.monthly?.balance || 0) >= 0
            ? 'bg-gradient-to-br from-indigo-400 to-indigo-600'
            : 'bg-gradient-to-br from-orange-400 to-orange-600'
        }`}>
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white/90 text-sm font-semibold mb-2 uppercase tracking-wide">Monthly Balance</p>
              <p className="text-4xl font-bold text-white mb-2">
                {formatCurrencyUtil(summary?.monthly?.balance || 0, userCurrency)}
              </p>
              
              {/* Status Indicator */}
              <div className="flex items-center gap-1 text-white/90 text-sm font-medium">
                {(summary?.monthly?.balance || 0) >= 0 ? (
                  <>
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    <span>Positive balance</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    <span>Deficit this month</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Animated Icon */}
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <FiDollarSign className="w-8 h-8 text-white animate-float" />
            </div>
          </div>
        </div>

        {/* Total Bank Balance Card - Gradient Style */}
        <div className="relative group overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-purple-400 to-purple-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform-gpu">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2 animate-float-delay"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-purple-50 text-sm font-semibold mb-2 uppercase tracking-wide">Total Balance</p>
              <p className="text-4xl font-bold text-white mb-2">
                {formatCurrencyUtil(summary?.totalBankBalance || 0, userCurrency)}
              </p>
              
              {/* Account Count */}
              <div className="flex items-center gap-1 text-purple-50 text-sm font-medium">
                <FiCreditCard className="w-4 h-4" />
                <span>{bankSummary?.length || 0} accounts</span>
              </div>
            </div>
            
            {/* Animated Icon */}
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
              <FiCreditCard className="w-8 h-8 text-white animate-float" />
            </div>
          </div>
        </div>
      </div>

      {/* Burn Rate Section */}
      {burnRate && (
        <div className="card p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-orange-500" />
              Monthly Burn Rate
            </h3>
            <Link
              to="/daily-notes"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              View Details <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">Daily Burn Rate</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrencyUtil(burnRate.averageDailyBurn, userCurrency)}
              </p>
              <p className="text-xs text-gray-400">per day avg</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">Projected Monthly</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrencyUtil(burnRate.projectedMonthlyExpense, userCurrency)}
              </p>
              <p className="text-xs text-gray-400">{burnRate.remainingDays} days left</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatCurrencyUtil(burnRate.totalExpense, userCurrency)}
              </p>
              <p className="text-xs text-gray-400">this month</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">Active Days</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {burnRate.daysWithExpense}/{burnRate.daysElapsed}
              </p>
              <p className="text-xs text-gray-400">days tracked</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Chart - Glassmorphism */}
        <div className="relative rounded-3xl overflow-hidden group">
          {/* Glass Background */}
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl"></div>
          
          {/* Border Glow on Hover */}
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-primary-500/50 transition-all duration-300"></div>
          
          {/* Chart Content */}
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Income vs Expense Trend
              </h3>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
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
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      padding: '12px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    }}
                    formatter={(value) => formatCurrencyUtil(value, userCurrency)}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                    name="Income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                    name="Expense"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Breakdown - Glassmorphism */}
        <div className="relative rounded-3xl overflow-hidden group">
          {/* Glass Background */}
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl"></div>
          
          {/* Border Glow on Hover */}
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-purple-500/50 transition-all duration-300"></div>
          
          {/* Chart Content */}
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Expense by Category
              </h3>
            </div>
            
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
                      {categoryBreakdown.map((entry, index) => {
                        const color = getCategoryColor(entry.category) || COLORS[index % COLORS.length];
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        padding: '12px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                      }}
                      formatter={(value) => formatCurrencyUtil(value, userCurrency)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <FiPieChart className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No expense data available</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start tracking your expenses</p>
                  </div>
                </div>
              )}
            </div>
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
                    {formatCurrencyUtil(bank.balance, userCurrency)}
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
                    {formatCurrencyUtil(transaction.amount, userCurrency)}
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
                formatter={(value) => formatCurrencyUtil(value, userCurrency)}
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
