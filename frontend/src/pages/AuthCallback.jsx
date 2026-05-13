import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { markAuthInitialized } from '../hooks/useAuth';
import { authService } from '../services/auth';
import { useAuthStore } from '../stores/authStore';

/**
 * OAuth Callback Handler
 *
 * This page handles the redirect after Google OAuth login.
 * It stores the session ID, fetches the session directly (bypassing useAuth
 * to avoid race conditions with initAuth), then navigates to the dashboard.
 */
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent running more than once (React strict mode / re-renders)
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const success = searchParams.get('success');
      const error = searchParams.get('error');
      const sessionId = searchParams.get('sid'); // Get session ID from URL

      if (error) {
        navigate('/login?error=' + error, { replace: true });
        return;
      }

      if (success === 'true') {
        // Store session ID in localStorage BEFORE any API calls
        if (sessionId) {
          console.log('Storing session ID from URL:', sessionId);
          localStorage.setItem('sessionId', sessionId);
        }

        // Small delay to ensure backend session is fully saved
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          // Fetch session directly — bypasses useAuth's initAuth to avoid race condition
          const sessionData = await authService.getSession();

          if (sessionData && sessionData.user) {
            // Write directly to Zustand store and mark auth as initialized
            // so useAuth's initAuth doesn't re-run on the next page
            setSession(sessionData);
            markAuthInitialized();
            navigate('/app/dashboard', { replace: true });
          } else {
            navigate('/login?error=session_not_found', { replace: true });
          }
        } catch (err) {
          console.error('Failed to fetch session after OAuth callback:', err);
          navigate('/login?error=session_fetch_failed', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, setSession]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-white text-lg font-medium">Completing sign in...</p>
        <p className="mt-2 text-primary/70 text-sm">Please wait while we set up your session</p>
      </div>
    </div>
  );
};

export default AuthCallback;
