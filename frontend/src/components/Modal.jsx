import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

// Updated: 2026-02-05 21:10 - Fixed centering and visibility
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Trigger animation after mount
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-3xl', // Increased from max-w-lg for better visibility
    lg: 'max-w-5xl', // Increased from max-w-2xl
    xl: 'max-w-7xl', // Increased from max-w-4xl
    full: 'max-w-full',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500/75 dark:bg-gray-900/80">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 transition-opacity duration-300 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal Container - Starts from top */}
      <div className="relative min-h-screen flex items-start justify-center p-4 sm:p-6">
        {/* Modal - Larger width, better spacing */}
        <div
          className={`relative w-full ${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition-all duration-300 ease-out transform ${
            isAnimating 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4'
          } flex flex-col my-4`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800 rounded-t-xl">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:rotate-90"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content - Larger padding */}
          <div className="px-6 py-6 sm:px-8 sm:py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
