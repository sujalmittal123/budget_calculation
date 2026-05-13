import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import OfflineBanner from './components/OfflineBanner';
import PrivateRoute from './components/PrivateRoute';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { ThemeProvider } from './context/ThemeContext';
import AuthCallback from './pages/AuthCallback';
import BankAccounts from './pages/BankAccounts';
import DailyNotes from './pages/DailyNotes';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import RecurringTransactions from './pages/RecurringTransactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-background transition-colors duration-200">
            <OfflineBanner />
            <PWAInstallPrompt />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route
                path="/app"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="bank-accounts" element={<BankAccounts />} />
                <Route path="daily-notes" element={<DailyNotes />} />
                <Route path="recurring" element={<RecurringTransactions />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
