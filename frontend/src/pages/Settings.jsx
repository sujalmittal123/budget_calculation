import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiDollarSign, FiLock, FiMoon, FiSave, FiSun, FiUser } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';

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
    <div className="space-y-6 animate-fade-in-up max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-chart-3 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <div className="relative rounded-3xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-chart-3/10"></div>
        <div className="relative bg-card rounded-xl shadow-sm border border-border p-8 border-2 border-transparent group-hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-chart-3/100 rounded-2xl flex items-center justify-center shadow-lg">
              <FiUser className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">
                Update your personal information
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5 text-base">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-input rounded-lg bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5 text-base">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 border border-input rounded-lg bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring bg-background cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <FiLock className="w-3 h-3" /> Email cannot be changed
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading.profile}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium flex items-center gap-2 px-6 py-3 text-base"
              >
                <FiSave className="w-5 h-5" />
                {loading.profile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Budget Settings */}
      <div className="relative rounded-3xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-2/10 to-chart-1/10"></div>
        <div className="relative bg-card rounded-xl shadow-sm border border-border p-8 border-2 border-transparent group-hover:border-chart-2/30 transition-all duration-300">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-chart-2 to-chart-1 rounded-2xl flex items-center justify-center shadow-lg">
              <FiDollarSign className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Budget Settings</h2>
              <p className="text-sm text-muted-foreground">
                Set your monthly spending limits
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 text-base">Monthly Budget Limit</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-semibold">
                  $
                </span>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={profileData.monthlyBudgetLimit}
                  onChange={(e) =>
                    setProfileData({ ...profileData, monthlyBudgetLimit: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-input rounded-lg bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring pl-10 text-lg"
                  placeholder="Enter your monthly budget limit"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-chart-2 rounded-full"></span>
                You'll be alerted when your expenses exceed this limit
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading.profile}
                className="bg-chart-2 text-white hover:bg-chart-2/90 px-4 py-2 rounded-lg font-medium flex items-center gap-2 px-6 py-3 text-base"
              >
                <FiSave className="w-5 h-5" />
                {loading.profile ? 'Saving...' : 'Save Budget'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="relative rounded-3xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-3/10 to-chart-5/10"></div>
        <div className="relative bg-card rounded-xl shadow-sm border border-border p-8 border-2 border-transparent group-hover:border-primary/30 transition-all duration-300">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-chart-3 to-chart-5 rounded-2xl flex items-center justify-center shadow-lg">
              {darkMode ? (
                <FiMoon className="w-7 h-7 text-white" />
              ) : (
                <FiSun className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Appearance</h2>
              <p className="text-sm text-muted-foreground">
                Customize how the app looks
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-card/50 rounded-2xl border-2 border-border hover:border-primary transition-all duration-300">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${ darkMode ? 'bg-primary/100' : 'bg-chart-4' } transition-colors duration-300`}
              >
                {darkMode ? (
                  <FiMoon className="w-6 h-6 text-white" />
                ) : (
                  <FiSun className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  {darkMode ? 'Embrace the darkness' : 'Light up your experience'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-hidden focus:ring-4 focus:ring-ring/30 ${ darkMode ? 'bg-primary' : 'bg-muted' }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-card transition-transform duration-300 shadow-lg ${ darkMode ? 'translate-x-9' : 'translate-x-1' }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Password Settings - Hidden for OAuth users */}
      {false && (
        <div className="relative rounded-3xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-destructive/10"></div>
          <div className="relative bg-card rounded-xl shadow-sm border border-border p-8 border-2 border-transparent group-hover:border-destructive/30 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-destructive/100 to-destructive rounded-2xl flex items-center justify-center shadow-lg">
                <FiLock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Change Password
                </h2>
                <p className="text-sm text-muted-foreground">
                  Update your password for security
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5 text-base">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-input rounded-lg bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 text-base">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-input rounded-lg bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 text-base">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-input rounded-lg bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading.password}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-lg font-medium flex items-center gap-2 px-6 py-3 text-base"
                >
                  <FiLock className="w-5 h-5" />
                  {loading.password ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
