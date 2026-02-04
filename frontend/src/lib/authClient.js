import { createAuthClient } from 'better-auth/react';

/**
 * Better-Auth Client Configuration
 * 
 * This creates a client instance for Better-Auth that handles:
 * - Google OAuth authentication
 * - Session management with HTTPOnly cookies
 * - Automatic token refresh
 * - CSRF protection
 */

// Use relative URL in development (proxied by Vite)
// In production, this should be your API domain
const baseURL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'http://localhost:5000'
  : 'http://localhost:5000';

export const authClient = createAuthClient({
  // Base URL for auth API (backend)
  baseURL,
  
  // Credentials must be included for HTTPOnly cookies
  credentials: 'include',
  
  // Social providers configuration
  socialProviders: {
    google: {
      // Redirect URI after Google OAuth
      redirectTo: '/dashboard',
    },
  },
});

/**
 * Auth actions for use in components
 */
export const {
  // Sign in with Google
  signIn,
  
  // Sign out
  signOut,
  
  // Get current session
  useSession,
  
  // Session loading state
  $sessionLoading,
} = authClient;
