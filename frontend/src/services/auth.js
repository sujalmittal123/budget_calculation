/**
 * Auth API Service
 * Handles authentication with Google OAuth
 *
 * In production, all /api/* requests are proxied through Vercel rewrites
 * to the Azure backend, so they are same-origin (no CORS needed).
 * Only the OAuth redirect needs the full backend URL (full page navigation).
 */

// Full backend URL — only used for OAuth redirect (full page navigation, not fetch)
const BACKEND_URL = import.meta.env.VITE_API_URL || '';

/**
 * Initiate Google OAuth sign-in
 * This is a full page redirect, not a fetch — needs the real backend URL
 */
export const signInWithGoogle = () => {
  window.location.href = `${BACKEND_URL}/api/auth/google`;
};

/**
 * Get current user session
 * Uses relative URL — proxied through Vercel rewrites in production
 */
export const getSession = async () => {
  // Get session ID from localStorage (fallback for cross-domain cookie issues)
  const sessionId = localStorage.getItem('sessionId');
  
  const headers = {};
  
  // Add custom session ID header if available
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }
  
  const response = await fetch('/api/auth/session', {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }

  const data = await response.json();
  return data.data; // Returns { user: {...} } or null
};

/**
 * Sign out current user
 * Uses relative URL — proxied through Vercel rewrites in production
 */
export const signOut = async () => {
  const sessionId = localStorage.getItem('sessionId');
  const headers = {};
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  const response = await fetch('/api/auth/signout', {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to sign out');
  }

  const data = await response.json();
  return data;
};

export const authService = {
  signInWithGoogle,
  getSession,
  signOut,
};
