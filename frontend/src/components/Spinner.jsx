const Spinner = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`${sizeClasses[size]} animate-spin rounded-full border-gray-200 dark:border-gray-700 border-t-primary-600 dark:border-t-primary-400`}
        />
        {/* Inner pulse */}
        {(size === 'lg' || size === 'xl') && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400 animate-pulse" />
          </div>
        )}
      </div>
      {fullScreen && (
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          Loading...
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 animate-fade-in">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Spinner;
