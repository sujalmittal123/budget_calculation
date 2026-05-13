import { Component } from 'react';
import { FiAlertTriangle, FiHome, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-card/80 backdrop-blur-lg border border-border p-8 rounded-2xl shadow-xl">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                  <FiAlertTriangle className="w-10 h-10 text-destructive" />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-3xl font-bold text-center text-foreground mb-4">
                Oops! Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-center text-muted-foreground mb-8">
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-8 p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                  <h2 className="text-sm font-semibold text-destructive mb-2">
                    Error Details (Development Mode):
                  </h2>
                  <pre className="text-xs text-destructive overflow-x-auto whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs font-medium text-destructive cursor-pointer">
                        Component Stack
                      </summary>
                      <pre className="text-xs text-destructive mt-2 overflow-x-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <FiRefreshCw className="w-5 h-5" />
                  Try Again
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted hover:bg-muted text-foreground font-medium rounded-lg transition-colors duration-200"
                >
                  <FiHome className="w-5 h-5" />
                  Go to Dashboard
                </button>
              </div>

              {/* Help Text */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                If the problem persists, please try refreshing the page or{' '}
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/';
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  clear your browser data
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
