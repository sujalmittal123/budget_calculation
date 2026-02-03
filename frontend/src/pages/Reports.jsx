import { useState, useEffect } from 'react';
import { FiDownload, FiCalendar } from 'react-icons/fi';
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
import { dashboardAPI, exportAPI } from '../services/api';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState([]);

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
  const PAYMENT_COLORS = {
    card: '#3B82F6',
    cash: '#10B981',
    upi: '#8B5CF6',
    bank_transfer: '#F59E0B',
    cheque: '#EC4899',
    other: '#6B7280',
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth, selectedYear]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = { month: selectedMonth, year: selectedYear };
      const [summaryRes, categoryRes, trendRes, paymentRes] = await Promise.all([
        dashboardAPI.getSummary(params),
        dashboardAPI.getCategoryBreakdown(params),
        dashboardAPI.getMonthlyTrend(),
        dashboardAPI.getPaymentMethodBreakdown(params),
      ]);

      setSummary(summaryRes.data.data);
      setCategoryBreakdown(categoryRes.data.data);
      setMonthlyTrend(trendRes.data.data);
      setPaymentBreakdown(paymentRes.data.data);
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await exportAPI.reportPDF({ month: selectedMonth, year: selectedYear });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-report-${selectedMonth}-${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

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
            Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Detailed financial reports and analytics
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FiCalendar className="w-5 h-5 text-gray-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="input py-2"
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="input py-2"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExportPDF}
            className="btn-primary flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Income</p>
          <p className="text-2xl font-bold text-success-600 dark:text-success-400">
            {formatCurrency(summary?.monthly?.income || 0)}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Expenses</p>
          <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">
            {formatCurrency(summary?.monthly?.expense || 0)}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Net Balance</p>
          <p className={`text-2xl font-bold ${
            (summary?.monthly?.balance || 0) >= 0 
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-danger-600 dark:text-danger-400'
          }`}>
            {formatCurrency(summary?.monthly?.balance || 0)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            12-Month Trend
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
                <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" name="Expense" />
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
              <div className="h-full flex items-center justify-center text-gray-500">
                No expense data for this period
              </div>
            )}
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            By Payment Method
          </h3>
          <div className="h-72">
            {paymentBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                  <YAxis type="category" dataKey="paymentMethod" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                    {paymentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[entry.paymentMethod] || '#6B7280'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No payment data for this period
              </div>
            )}
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Income vs Expense Comparison
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
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

      {/* Category Details Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Category-wise Summary for {months[selectedMonth - 1]} {selectedYear}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transactions</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {categoryBreakdown.length > 0 ? (
                categoryBreakdown.map((cat, index) => (
                  <tr key={cat.category} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {cat.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(cat.total)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      {cat.count}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      {cat.percentage}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    No expense data for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
