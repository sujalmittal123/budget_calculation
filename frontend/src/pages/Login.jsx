import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaGoogle } from 'react-icons/fa';
import { FiCheckCircle, FiShield, FiTrendingUp, FiZap } from 'react-icons/fi';

const Login = () => {
  const { signInWithGoogle, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 gradient-animate">
        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-400/30 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl animate-float-delay"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-float"></div>
        
        {/* Particle Effect */}
        <div className="particles-bg absolute inset-0"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Glassmorphism Card */}
          <div className="glass-morphism rounded-3xl p-8 shadow-2xl animate-scale-in">
            {/* Animated Logo */}
            <div className="text-center mb-8 animate-bounce-in">
              <div className="relative inline-block">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur-2xl opacity-75 animate-pulse"></div>
                
                {/* Logo Container */}
                <div className="relative w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center text-5xl shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all duration-500 cursor-pointer glow-effect">
                  💰
                </div>
              </div>
              
              <h1 className="text-5xl font-bold mt-6 text-white drop-shadow-lg">
                Budget Tracker
              </h1>
              <p className="text-white/90 mt-3 text-lg font-medium">
                Smart money management made simple ✨
              </p>
            </div>

            {/* Google Sign-In Button */}
            <button
              onClick={signInWithGoogle}
              disabled={isLoading}
              className="relative group w-full bg-white text-gray-900 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl transform-gpu disabled:opacity-50 disabled:cursor-not-allowed btn-shine overflow-hidden"
            >
              {/* Button Shine Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full transform"></div>
              
              <div className="relative flex items-center justify-center gap-3">
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <FaGoogle className="text-2xl text-red-500 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-lg">Continue with Google</span>
                  </>
                )}
              </div>
            </button>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium flex items-center gap-1.5 hover:bg-white/30 transition-all duration-300 cursor-default">
                <FiShield className="w-4 h-4" /> Secure
              </span>
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium flex items-center gap-1.5 hover:bg-white/30 transition-all duration-300 cursor-default">
                <FiTrendingUp className="w-4 h-4" /> Analytics
              </span>
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium flex items-center gap-1.5 hover:bg-white/30 transition-all duration-300 cursor-default">
                <FiZap className="w-4 h-4" /> Fast
              </span>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20">
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-xs text-white/80 mt-1">Users</div>
              </div>
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold text-white">$2M+</div>
                <div className="text-xs text-white/80 mt-1">Tracked</div>
              </div>
              <div className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold text-white flex items-center justify-center gap-1">
                  4.9<span className="text-yellow-300">★</span>
                </div>
                <div className="text-xs text-white/80 mt-1">Rating</div>
              </div>
            </div>

            {/* Features List */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-white/90 hover:text-white transition-colors duration-300">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Track income and expenses across multiple accounts</span>
              </div>
              <div className="flex items-center gap-3 text-white/90 hover:text-white transition-colors duration-300">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Beautiful analytics with real-time insights</span>
              </div>
              <div className="flex items-center gap-3 text-white/90 hover:text-white transition-colors duration-300">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Secure, private, and completely free to use</span>
              </div>
            </div>

            {/* Footer Text */}
            <p className="text-xs text-center text-white/60 mt-8">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          {/* Additional Info Below Card */}
          <div className="text-center mt-6 text-white/80 text-sm">
            <p>🔒 Your data is encrypted and secure</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
