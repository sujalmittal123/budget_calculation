import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/auth';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

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
   * Refresh session
   */
  const refreshSession = async () => {
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
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      
      // Call API to update profile
      const response = await authAPI.updateProfile(updates);
      
      if (response.data.success) {
        // Update local state
        updateUserProfile(response.data.data);
        
        // Refresh session to sync
        await refreshSession();
        
        return response.data.data;
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
    logout,
    refreshSession,
    updateProfile,
  };
};
