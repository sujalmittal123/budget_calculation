import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';

/**
 * OAuth Callback Handler
 * 
 * This page handles the redirect after Google OAuth login.
 * It refreshes the session and redirects to dashboard.
 */
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSession } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const success = searchParams.get('success');
      const error = searchParams.get('error');

      if (error) {
        navigate('/login?error=' + error);
        return;
      }

      if (success === 'true') {
        
        // Small delay to ensure backend session is fully saved
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh session to get user data
        const sessionData = await refreshSession();
        
        if (sessionData && sessionData.user) {
          navigate('/app/dashboard', { replace: true });
        } else {
          navigate('/login?error=session_not_found');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshSession]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-white text-lg font-medium">
          Completing sign in...
        </p>
        <p className="mt-2 text-primary-100 text-sm">
          Please wait while we set up your session
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
