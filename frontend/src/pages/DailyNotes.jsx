import { addDays, format, subDays } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiAlertCircle,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiEdit3,
  FiFrown,
  FiMeh,
  FiSave,
  FiSmile,
  FiTrendingDown,
} from 'react-icons/fi';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Spinner from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { dailyNotesAPI, transactionsAPI } from '../services/api';
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol } from '../utils/currency';

const MOODS = [
  { value: 'great', label: 'Great', emoji: '😄', color: 'text-chart-2' },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'text-chart-1' },
  { value: 'okay', label: 'Okay', emoji: '😐', color: 'text-chart-4' },
  { value: 'bad', label: 'Bad', emoji: '😕', color: 'text-chart-5' },
  { value: 'terrible', label: 'Terrible', emoji: '😢', color: 'text-destructive' },
];

const DailyNotes = () => {
  const { user } = useAuth();
  const userCurrency = user?.preferences?.currency || 'USD';
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dailyData, setDailyData] = useState(null);
  const [burnRate, setBurnRate] = useState(null);
  const [note, setNote] = useState({
    notes: '',
    mood: 'okay',
    dailyBudget: 0,
    highlights: [],
    tags: [],
  });
  const [newHighlight, setNewHighlight] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const formatCurrency = (value) => formatCurrencyUtil(value, userCurrency);
  const currencySymbol = getCurrencySymbol(userCurrency);

  useEffect(() => {
    fetchDailyData();
  }, [selectedDate]);

  useEffect(() => {
    fetchBurnRate();
  }, []);

  const fetchDailyData = async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await dailyNotesAPI.getByDate(dateStr);
      setDailyData(response.data.data);

      if (response.data.data.note) {
        setNote({
          notes: response.data.data.note.notes || '',
          mood: response.data.data.note.mood || 'okay',
          dailyBudget: response.data.data.note.dailyBudget || 0,
          highlights: response.data.data.note.highlights || [],
          tags: response.data.data.note.tags || [],
        });
      } else {
        setNote({
          notes: '',
          mood: 'okay',
          dailyBudget: 0,
          highlights: [],
          tags: [],
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchBurnRate = async () => {
    try {
      const response = await dailyNotesAPI.getBurnRate();
      setBurnRate(response.data.data);
    } catch (error) {}
  };

  const handleSaveNote = async () => {
    try {
      setSaving(true);
      await dailyNotesAPI.create({
        date: format(selectedDate, 'yyyy-MM-dd'),
        ...note,
      });
      toast.success('Note saved successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setNote((prev) => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()],
      }));
      setNewHighlight('');
    }
  };

  const removeHighlight = (index) => {
    setNote((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
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
            Daily Notes & Expenses 📝
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your daily expenses and personal notes
          </p>
        </div>
      </div>

      {/* Burn Rate Summary Cards */}
      {burnRate && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Average Daily Burn */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 bg-gradient-to-br from-chart-5/10 to-destructive/10 border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-chart-5">
                  Daily Burn Rate
                </p>
                <p className="text-2xl font-bold text-chart-5 mt-1">
                  {formatCurrency(burnRate.averageDailyBurn)}
                </p>
                <p className="text-xs text-chart-5 mt-1">per day average</p>
              </div>
              <div className="w-12 h-12 bg-chart-5/10 rounded-xl flex items-center justify-center">
                <FiTrendingDown className="w-6 h-6 text-chart-5" />
              </div>
            </div>
          </div>

          {/* Projected Monthly */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 bg-gradient-to-br from-chart-3/10 to-primary/10 border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-chart-3">
                  Projected Monthly
                </p>
                <p className="text-2xl font-bold text-chart-3 mt-1">
                  {formatCurrency(burnRate.projectedMonthlyExpense)}
                </p>
                <p className="text-xs text-chart-3 mt-1">
                  {burnRate.remainingDays} days remaining
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-3/10 rounded-xl flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </div>

          {/* Highest Spending Day */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 bg-gradient-to-br from-destructive/10 to-chart-5/10 border-destructive/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">
                  Highest Spend Day
                </p>
                <p className="text-2xl font-bold text-destructive mt-1">
                  {formatCurrency(burnRate.highestSpendingDay?.amount)}
                </p>
                <p className="text-xs text-destructive mt-1">
                  {burnRate.highestSpendingDay?.date || 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </div>

          {/* Days with Expenses */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 bg-gradient-to-br from-chart-1/10 to-chart-1/10 border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-chart-1">Active Days</p>
                <p className="text-2xl font-bold text-chart-1 mt-1">
                  {burnRate.daysWithExpense} / {burnRate.daysElapsed}
                </p>
                <p className="text-xs text-chart-1 mt-1">days with expenses</p>
              </div>
              <div className="w-12 h-12 bg-chart-1/10 rounded-xl flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Burn Chart */}
      {burnRate?.dailyBreakdown?.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            📊 Daily Expense Trend (This Month)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={burnRate.dailyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="_id"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => format(new Date(value), 'dd')}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Expense']}
                labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
              />
              <Area
                type="monotone"
                dataKey="dailyTotal"
                stroke="#EF4444"
                fill="#FEE2E2"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Date Navigator & Daily Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Date Navigator */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-lg hover:bg-background transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isToday ? 'Today' : format(selectedDate, 'EEEE')}
              </p>
              <p className="text-xl font-bold text-foreground">
                {format(selectedDate, 'MMMM dd, yyyy')}
              </p>
            </div>

            <button
              onClick={handleNextDay}
              disabled={isToday}
              className={`p-2 rounded-lg transition-colors ${ isToday ? 'opacity-50 cursor-not-allowed' : 'hover:bg-background ' }`}
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Daily Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-chart-2/10 rounded-lg">
              <p className="text-xs text-chart-2">Income</p>
              <p className="text-lg font-bold text-chart-2">
                {formatCurrency(dailyData?.totals?.income)}
              </p>
            </div>
            <div className="text-center p-3 bg-destructive/10 rounded-lg">
              <p className="text-xs text-destructive">Expense</p>
              <p className="text-lg font-bold text-destructive">
                {formatCurrency(dailyData?.totals?.expense)}
              </p>
            </div>
            <div className="text-center p-3 bg-chart-1/10 rounded-lg">
              <p className="text-xs text-chart-1">Balance</p>
              <p
                className={`text-lg font-bold ${ (dailyData?.totals?.balance || 0) >= 0 ? 'text-chart-1 ' : 'text-destructive ' }`}
              >
                {formatCurrency(dailyData?.totals?.balance)}
              </p>
            </div>
          </div>

          {/* Transactions List */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Transactions ({dailyData?.transactions?.length || 0})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dailyData?.transactions?.length > 0 ? (
                dailyData.transactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between p-3 bg-background rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${ tx.type === 'income' ? 'bg-chart-2' : 'bg-destructive' }`}
                      />
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {tx.description || tx.category}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {tx.category} • {tx.paymentMethod?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${ tx.type === 'income' ? 'text-chart-2' : 'text-destructive' }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No transactions for this day
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Daily Notes Editor */}
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              📝 Personal Notes
            </h3>
            <button
              onClick={() => (isEditing ? handleSaveNote() : setIsEditing(true))}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${ isEditing ? 'bg-primary text-white hover:bg-primary' : 'bg-background hover:bg-muted ' }`}
            >
              {saving ? (
                <Spinner size="sm" />
              ) : isEditing ? (
                <>
                  <FiSave className="w-4 h-4" />
                  Save
                </>
              ) : (
                <>
                  <FiEdit3 className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>
          </div>

          {/* Mood Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              How was your day?
            </label>
            <div className="flex gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => isEditing && setNote((prev) => ({ ...prev, mood: mood.value }))}
                  disabled={!isEditing}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${ note.mood === mood.value ? 'border-primary bg-primary/10 ' : 'border-border hover:border-border' } ${!isEditing && 'cursor-default'}`}
                >
                  <span className="text-xl">{mood.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes Textarea */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Notes
            </label>
            <textarea
              value={note.notes}
              onChange={(e) => setNote((prev) => ({ ...prev, notes: e.target.value }))}
              disabled={!isEditing}
              rows={4}
              placeholder="Write about your day, expenses, thoughts..."
              className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Daily Budget */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Daily Budget Target ({currencySymbol})
            </label>
            <input
              type="number"
              value={note.dailyBudget}
              onChange={(e) =>
                setNote((prev) => ({ ...prev, dailyBudget: parseFloat(e.target.value) || 0 }))
              }
              disabled={!isEditing}
              className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Highlights */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Day Highlights
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {note.highlights.map((highlight, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {highlight}
                  {isEditing && (
                    <button
                      onClick={() => removeHighlight(index)}
                      className="ml-1 hover:text-primary"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addHighlight()}
                  placeholder="Add a highlight..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground"
                />
                <button
                  onClick={addHighlight}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Burn Rate */}
      {burnRate?.weeklyBurn?.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            📈 Weekly Burn Rate Comparison
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={burnRate.weeklyBurn}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tickFormatter={(week) => `Week ${week}`} />
              <YAxis />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Total']}
                labelFormatter={(week) => `Week ${week}`}
              />
              <Bar dataKey="total" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DailyNotes;
