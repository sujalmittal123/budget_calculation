/**
 * Auth API Service
 * Handles authentication with Google OAuth
 */

// Use relative URLs to leverage Vite proxy
const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || ''
  : '';

/**
 * Initiate Google OAuth sign-in
 * Redirects to backend which then redirects to Google
 */
export const signInWithGoogle = () => {
  window.location.href = `${API_BASE_URL}/api/auth/google`;
};

/**
 * Get current user session
 */
export const getSession = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
    method: 'GET',
    credentials: 'include', // Important: send cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }

  const data = await response.json();
  return data.data; // Returns { user: {...} } or null
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/signout`, {
    method: 'POST',
    credentials: 'include', // Important: send cookies
    headers: {
      'Content-Type': 'application/json',
    },
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
