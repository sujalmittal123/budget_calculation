import { useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { authService } from '../services/auth';
import { useAuthStore } from '../stores/authStore';

/**
 * Custom Hook for Authentication
 *
 * Provides a clean API for authentication operations.
 * Uses session-based auth with Google OAuth.
 *
 * Usage:
 * ```jsx
 * const { user, isAuthenticated, isLoading, signInWithGoogle, logout } = useAuth();
 * ```
 */

// Global flag to prevent multiple auth initializations
let authInitialized = false;
let authInitializing = false;

/**
 * Mark auth as initialized from outside the hook (e.g., AuthCallback).
 * This prevents useAuth's initAuth from re-running after AuthCallback
 * has already fetched and stored the session.
 */
export const markAuthInitialized = () => {
  authInitialized = true;
  authInitializing = false;
};

export const useAuth = () => {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    error,
    setSession,
    setLoading,
    setError,
    clearAuth,
    updateUserProfile,
  } = useAuthStore();

  const initRef = useRef(false);

  // Initialize auth session on mount
  useEffect(() => {
    // Prevent multiple initializations globally
    if (authInitialized || authInitializing || initRef.current) {
      return;
    }

    // Skip initAuth on the OAuth callback page — AuthCallback handles its own session fetch.
    // Running initAuth here would race with AuthCallback (no sessionId in localStorage yet)
    // and call clearAuth(), wiping state before the callback can complete.
    if (window.location.pathname === '/auth/callback') {
      return;
    }

    initRef.current = true;
    authInitializing = true;

    const initAuth = async () => {
      try {
        setLoading(true);

        // Fetch current session
        const sessionData = await authService.getSession();

        if (sessionData && sessionData.user) {
          setSession(sessionData);
        } else {
          clearAuth();
        }

        authInitialized = true;
      } catch (err) {
        clearAuth();
      } finally {
        setLoading(false);
        authInitializing = false;
      }
    };

    initAuth();
  }, [setSession, setLoading, clearAuth]);

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = () => {
    try {
      setLoading(true);
      setError(null);

      // Redirect to Google OAuth
      authService.signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
      toast.error('Failed to sign in with Google');
      setLoading(false);
    }
  };

  /**
   * Sign in with Email and Password
   */
  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authService.signInWithEmail(email, password);
      if (res.data && res.data.user) {
        setSession(res.data);
        toast.success('Welcome back!');
        return res.data.user;
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in');
      toast.error(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up with Email, Name & Password
   */
  const signUpWithEmail = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await authService.signUpWithEmail(name, email, password);
      if (res.data && res.data.user) {
        setSession(res.data);
        toast.success('Account created successfully!');
        return res.data.user;
      }
    } catch (err) {
      setError(err.message || 'Failed to sign up');
      toast.error(err.message || 'Failed to sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Instant 1-Click Demo Sign In
   */
  const signInAsDemo = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authService.signInAsDemo();
      if (res.data && res.data.user) {
        setSession(res.data);
        toast.success('Signed in as Demo User');
        return res.data.user;
      }
    } catch (err) {
      setError(err.message || 'Demo sign-in failed');
      toast.error(err.message || 'Demo sign-in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out
   */
  const logout = async () => {
    try {
      setLoading(true);

      // Call sign-out endpoint
      await authService.signOut();

      // Clear local state
      clearAuth();

      toast.success('Signed out successfully');

      // Redirect to login
      window.location.href = '/';
    } catch (err) {
      toast.error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh session (stable reference via useCallback)
   */
  const refreshSession = useCallback(async () => {
    try {
      const sessionData = await authService.getSession();

      if (sessionData && sessionData.user) {
        setSession(sessionData);
        return sessionData;
      }

      clearAuth();
      return null;
    } catch (err) {
      clearAuth();
      return null;
    }
  }, [setSession, clearAuth]);

  /**
   * Update user profile
   */
  const updateProfile = async (updates) => {
    try {
      setLoading(true);

      // Call API to update profile
      const response = await authAPI.updateProfile(updates);

      if (response.data.success && response.data.data) {
        // Update local state
        updateUserProfile(response.data.data.user);

        // Refresh session to sync
        await refreshSession();

        return response.data.data.user;
      }

      throw new Error('Failed to update profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    user,
    session,
    isLoading,
    isAuthenticated,
    error,

    // Actions
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsDemo,
    logout,
    refreshSession,
    updateProfile,
  };
};
