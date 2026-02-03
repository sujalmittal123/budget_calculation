import { useState } from 'react';
import { FiUser, FiLock, FiDollarSign, FiMoon, FiSun, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    monthlyBudgetLimit: user?.monthlyBudgetLimit || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState({ profile: false, password: false });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, profile: true });

    try {
      await updateProfile({
        name: profileData.name,
        monthlyBudgetLimit: parseFloat(profileData.monthlyBudgetLimit) || 0,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading({ ...loading, profile: false });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading({ ...loading, password: true });

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading({ ...loading, password: false });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-500/20 rounded-lg flex items-center justify-center">
            <FiUser className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Profile Settings
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your personal information
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                className="input bg-gray-100 dark:bg-gray-700"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading.profile}
              className="btn-primary flex items-center gap-2"
            >
              <FiSave className="w-4 h-4" />
              {loading.profile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Budget Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-success-100 dark:bg-success-500/20 rounded-lg flex items-center justify-center">
            <FiDollarSign className="w-5 h-5 text-success-600 dark:text-success-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Budget Settings
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Set your monthly spending limits
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="label">Monthly Budget Limit</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="100"
                min="0"
                value={profileData.monthlyBudgetLimit}
                onChange={(e) => setProfileData({ ...profileData, monthlyBudgetLimit: e.target.value })}
                className="input pl-8"
                placeholder="Enter your monthly budget limit"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              You'll be alerted when your expenses exceed this limit
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading.profile}
              className="btn-primary flex items-center gap-2"
            >
              <FiSave className="w-4 h-4" />
              {loading.profile ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>

      {/* Appearance Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
            {darkMode ? (
              <FiMoon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            ) : (
              <FiSun className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Appearance
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Customize how the app looks
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Switch between light and dark themes
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Password Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-danger-100 dark:bg-danger-500/20 rounded-lg flex items-center justify-center">
            <FiLock className="w-5 h-5 text-danger-600 dark:text-danger-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Change Password
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your password for security
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading.password}
              className="btn-danger flex items-center gap-2"
            >
              <FiLock className="w-4 h-4" />
              {loading.password ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
