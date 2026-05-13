import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiActivity,
  FiAlertCircle,
  FiArrowRight,
  FiCreditCard,
  FiDollarSign,
  FiPieChart,
  FiTrendingDown,
  FiTrendingUp,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import SkeletonLoader from '../components/SkeletonLoader';
import { getCategoryColor } from '../constants/categories';
import { useAuth } from '../hooks/useAuth';
import { dailyNotesAPI, dashboardAPI } from '../services/api';
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
          <div className="h-8 bg-muted rounded-sm w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded-sm w-1/4"></div>
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
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="h-6 bg-muted rounded-sm w-1/4 mb-4 animate-pulse"></div>
            <SkeletonLoader type="list" count={4} />
          </div>
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="h-6 bg-muted rounded-sm w-1/4 mb-4 animate-pulse"></div>
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}!{' '}
            <span className="inline-block animate-wiggle">👋</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your financial overview for this month
          </p>
        </div>
      </div>

      {/* Budget Alert */}
      {summary?.isOverBudget && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-3 animate-bounce-in">
          <FiAlertCircle className="w-6 h-6 text-destructive flex-shrink-0 animate-pulse" />
          <div>
            <p className="font-medium text-destructive">
              You've exceeded your monthly budget!
            </p>
            <p className="text-sm text-destructive">
              You've spent {formatCurrencyUtil(summary.monthly.expense, userCurrency)} out of your{' '}
              {formatCurrencyUtil(summary.budgetLimit, userCurrency)} budget limit.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Income Card - Gradient Style */}
        <div className="relative group overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-chart-2 to-chart-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform-gpu">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-card rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 animate-float"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-chart-2/80 text-sm font-semibold mb-2 uppercase tracking-wide">
                Monthly Income
              </p>
              <p className="text-4xl font-bold text-white mb-2">
                {formatCurrencyUtil(summary?.monthly?.income || 0, userCurrency)}
              </p>

              {/* Trend Indicator */}
              <div className="flex items-center gap-1 text-chart-2/80 text-sm font-medium">
                <FiTrendingUp className="w-4 h-4" />
                <span>Healthy cash flow</span>
              </div>
            </div>

            {/* Animated Icon */}
            <div className="w-16 h-16 bg-card/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <FiTrendingUp className="w-8 h-8 text-white animate-float" />
            </div>
          </div>
        </div>

        {/* Expense Card - Gradient Style */}
        <div className="relative group overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-destructive to-destructive shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform-gpu">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-card rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 animate-float-slow"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-destructive/80 text-sm font-semibold mb-2 uppercase tracking-wide">
                  Monthly Expenses
                </p>
                <p className="text-4xl font-bold text-white mb-2">
                  {formatCurrencyUtil(summary?.monthly?.expense || 0, userCurrency)}
                </p>
              </div>

              {/* Animated Icon */}
              <div className="w-16 h-16 bg-card/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                <FiTrendingDown className="w-8 h-8 text-white animate-float" />
              </div>
            </div>

            {/* Budget Progress Bar */}
            {summary?.budgetLimit > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-2 text-destructive/80 font-medium">
                  <span>Budget Usage</span>
                  <span className={summary?.isOverBudget ? 'font-bold' : ''}>
                    {summary?.budgetUsedPercent}%
                  </span>
                </div>
                <div className="w-full bg-card/20 backdrop-blur-sm rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${ summary?.isOverBudget ? 'bg-card animate-pulse' : 'bg-card/90' }`}
                    style={{ width: `${Math.min(summary?.budgetUsedPercent || 0, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Balance Card - Gradient Style */}
        <div
          className={`relative group overflow-hidden rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform-gpu ${ (summary?.monthly?.balance || 0) >= 0 ? 'bg-gradient-to-br from-primary to-primary' : 'bg-gradient-to-br from-chart-5 to-chart-5' }`}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-card rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white/90 text-sm font-semibold mb-2 uppercase tracking-wide">
                Monthly Balance
              </p>
              <p className="text-4xl font-bold text-white mb-2">
                {formatCurrencyUtil(summary?.monthly?.balance || 0, userCurrency)}
              </p>

              {/* Status Indicator */}
              <div className="flex items-center gap-1 text-white/90 text-sm font-medium">
                {(summary?.monthly?.balance || 0) >= 0 ? (
                  <>
                    <span className="w-2 h-2 bg-card rounded-full animate-pulse"></span>
                    <span>Positive balance</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-card rounded-full animate-pulse"></span>
                    <span>Deficit this month</span>
                  </>
                )}
              </div>
            </div>

            {/* Animated Icon */}
            <div className="w-16 h-16 bg-card/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <FiDollarSign className="w-8 h-8 text-white animate-float" />
            </div>
          </div>
        </div>

        {/* Total Bank Balance Card - Gradient Style */}
        <div className="relative group overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-chart-3 to-chart-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform-gpu">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-card rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2 animate-float-delay"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-chart-3/80 text-sm font-semibold mb-2 uppercase tracking-wide">
                Total Balance
              </p>
              <p className="text-4xl font-bold text-white mb-2">
                {formatCurrencyUtil(summary?.totalBankBalance || 0, userCurrency)}
              </p>

              {/* Account Count */}
              <div className="flex items-center gap-1 text-chart-3/80 text-sm font-medium">
                <FiCreditCard className="w-4 h-4" />
                <span>{bankSummary?.length || 0} accounts</span>
              </div>
            </div>

            {/* Animated Icon */}
            <div className="w-16 h-16 bg-card/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
              <FiCreditCard className="w-8 h-8 text-white animate-float" />
            </div>
          </div>
        </div>
      </div>

      {/* Burn Rate Section */}
      {burnRate && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 bg-gradient-to-r from-chart-5/10 to-destructive/10 border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FiActivity className="w-5 h-5 text-chart-5" />
              Monthly Burn Rate
            </h3>
            <Link
              to="/daily-notes"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View Details <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Daily Burn Rate</p>
              <p className="text-xl font-bold text-chart-5">
                {formatCurrencyUtil(burnRate.averageDailyBurn, userCurrency)}
              </p>
              <p className="text-xs text-muted-foreground">per day avg</p>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Projected Monthly</p>
              <p className="text-xl font-bold text-chart-3">
                {formatCurrencyUtil(burnRate.projectedMonthlyExpense, userCurrency)}
              </p>
              <p className="text-xs text-muted-foreground">{burnRate.remainingDays} days left</p>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-xl font-bold text-destructive">
                {formatCurrencyUtil(burnRate.totalExpense, userCurrency)}
              </p>
              <p className="text-xs text-muted-foreground">this month</p>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">Active Days</p>
              <p className="text-xl font-bold text-chart-1">
                {burnRate.daysWithExpense}/{burnRate.daysElapsed}
              </p>
              <p className="text-xs text-muted-foreground">days tracked</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Chart - Glassmorphism */}
        <div className="relative rounded-3xl overflow-hidden group">
          {/* Glass Background */}
          <div className="absolute inset-0 bg-card/80 backdrop-blur-xl"></div>

          {/* Border Glow on Hover */}
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-primary/50 transition-all duration-300"></div>

          {/* Chart Content */}
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-chart-2 to-chart-1 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-bold text-foreground">
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
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="monthName"
                    className="text-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    className="text-muted-foreground"
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
          <div className="absolute inset-0 bg-card/80 backdrop-blur-xl"></div>

          {/* Border Glow on Hover */}
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-primary/50 transition-all duration-300"></div>

          {/* Chart Content */}
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-gradient-to-r from-chart-3 to-chart-5 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-bold text-foreground">
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
                        const color =
                          getCategoryColor(entry.category) || COLORS[index % COLORS.length];
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
                    <div className="w-20 h-20 mx-auto mb-4 bg-background rounded-full flex items-center justify-center">
                      <FiPieChart className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      No expense data available
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start tracking your expenses
                    </p>
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
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Bank Accounts</h3>
            <Link
              to="/bank-accounts"
              className="text-primary hover:text-primary text-sm font-medium flex items-center gap-1"
            >
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="space-y-3">
            {bankSummary.length > 0 ? (
              bankSummary.slice(0, 4).map((bank) => (
                <div
                  key={bank.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: bank.color + '20' }}
                    >
                      <FiCreditCard style={{ color: bank.color }} className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{bank.bankName}</p>
                      <p className="text-xs text-muted-foreground">
                        {bank.maskedAccountNumber}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">
                    {formatCurrencyUtil(bank.balance, userCurrency)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <FiCreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No bank accounts added</p>
                <Link
                  to="/bank-accounts"
                  className="text-primary hover:text-primary text-sm font-medium"
                >
                  Add your first account
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Recent Transactions
            </h3>
            <Link
              to="/transactions"
              className="text-primary hover:text-primary text-sm font-medium flex items-center gap-1"
            >
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${ transaction.type === 'income' ? 'bg-chart-2/10 ' : 'bg-destructive/10 ' }`}
                    >
                      {transaction.type === 'income' ? (
                        <FiTrendingUp className="w-5 h-5 text-chart-2" />
                      ) : (
                        <FiTrendingDown className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground truncate max-w-[150px]">
                        {transaction.description || transaction.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${ transaction.type === 'income' ? 'text-chart-2 ' : 'text-destructive ' }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrencyUtil(transaction.amount, userCurrency)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <FiDollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No transactions yet</p>
                <Link
                  to="/transactions"
                  className="text-primary hover:text-primary text-sm font-medium"
                >
                  Add your first transaction
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Comparison Bar Chart */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Monthly Comparison
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
              />
              <XAxis
                dataKey="monthName"
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                className="text-muted-foreground"
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
