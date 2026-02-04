import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import {
  FiHome,
  FiCreditCard,
  FiDollarSign,
  FiPieChart,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiUser,
  FiBook,
  FiChevronDown,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const { user, logout, updateProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const currentCurrency = CURRENCIES.find(c => c.code === user?.preferences?.currency) || CURRENCIES[0];

  const handleCurrencyChange = async (currencyCode) => {
    try {
      await updateProfile({ preferences: { ...user.preferences, currency: currencyCode } });
      setCurrencyDropdownOpen(false);
      toast.success(`Currency changed to ${currencyCode}`);
    } catch (error) {
      toast.error('Failed to update currency');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/transactions', icon: FiDollarSign, label: 'Transactions' },
    { path: '/bank-accounts', icon: FiCreditCard, label: 'Bank Accounts' },
    { path: '/daily-notes', icon: FiBook, label: 'Daily Notes' },
    { path: '/reports', icon: FiPieChart, label: 'Reports' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  const NavItem = ({ path, icon: Icon, label }) => (
    <NavLink
      to={path}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-out transform hover:translate-x-1 ${
          isActive
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-[1.02]'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md'
        }`
      }
    >
      <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
      <span className="font-medium">{label}</span>
    </NavLink>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400 transition-all duration-300 hover:scale-105 cursor-default">
              <span className="inline-block animate-float">💰</span> BudgetTracker
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:rotate-90"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <FiUser className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-3 w-full px-4 py-2 text-danger-500 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-all duration-300 hover:translate-x-1"
            >
              <FiLogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiMenu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              {/* Currency Selector */}
              <div className="relative">
                <button
                  onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <span className="text-lg font-semibold">{currentCurrency.symbol}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">{currentCurrency.code}</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform ${currencyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {currencyDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setCurrencyDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Select Currency
                      </div>
                      {CURRENCIES.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => handleCurrencyChange(currency.code)}
                          className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            currentCurrency.code === currency.code ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                          }`}
                        >
                          <span className="text-xl w-6">{currency.symbol}</span>
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{currency.code}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{currency.name}</div>
                          </div>
                          {currentCurrency.code === currency.code && (
                            <span className="ml-auto text-primary-600">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FiSun className="w-5 h-5 text-yellow-500 transition-transform duration-500 hover:rotate-180" />
                ) : (
                  <FiMoon className="w-5 h-5 text-gray-600 transition-transform duration-500 hover:-rotate-12" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          <div className="animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
