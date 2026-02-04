import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authClient } from '../lib/authClient';
import toast from 'react-hot-toast';

/**
 * Custom Hook for Authentication
 * 
 * Provides a clean API for authentication operations.
 * Integrates Better-Auth with Zustand store.
 * 
 * Usage:
 * ```jsx
 * const { user, isAuthenticated, isLoading, signInWithGoogle, logout } = useAuth();
 * ```
 */

// API base URL - use relative URLs in development (proxied by Vite)
const API_BASE = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'http://localhost:5000'
  : 'http://localhost:5000';

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

  // Initialize auth session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Fetch current session from Better-Auth
        const response = await fetch(`${API_BASE}/api/auth/session`, {
          credentials: 'include', // Include HTTPOnly cookies
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setSession(data);
          } else {
            clearAuth();
          }
        } else {
          clearAuth();
        }
      } catch (err) {
        console.error('[Auth] Session initialization failed:', err);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Redirect to Google OAuth
      const googleAuthUrl = `${API_BASE}/api/auth/sign-in/google`;
      window.location.href = googleAuthUrl;
      
    } catch (err) {
      console.error('[Auth] Google sign-in failed:', err);
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
      
      // Call Better-Auth sign-out endpoint
      await fetch(`${API_BASE}/api/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear local state
      clearAuth();
      
      toast.success('Signed out successfully');
      
      // Redirect to login
      window.location.href = '/login';
      
    } catch (err) {
      console.error('[Auth] Sign-out failed:', err);
      toast.error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updates) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      updateUserProfile(data.user);
      toast.success('Profile updated successfully');
      
      return data.user;
    } catch (err) {
      console.error('[Auth] Profile update failed:', err);
      toast.error(err.message || 'Failed to update profile');
      throw err;
    }
  };

  /**
   * Refresh session
   */
  const refreshSession = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/session`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setSession(data);
          return data;
        }
      }
      
      clearAuth();
      return null;
    } catch (err) {
      console.error('[Auth] Session refresh failed:', err);
      clearAuth();
      return null;
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
    updateProfile,
    refreshSession,
  };
};
