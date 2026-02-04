import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Zustand Authentication Store
 * 
 * Global state management for user authentication.
 * Replaces the old AuthContext with better performance.
 * 
 * Features:
 * - Centralized auth state
 * - Automatic persistence (user data only)
 * - No unnecessary re-renders
 * - Simple API
 */

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      // Actions
      setSession: (session) => {
        set({
          session,
          user: session?.user || null,
          isAuthenticated: !!session?.user,
          isLoading: false,
          error: null,
        });
      },

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      clearAuth: () => {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      updateUserProfile: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...updates,
            },
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist user data, not session (session is in HTTPOnly cookies)
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
