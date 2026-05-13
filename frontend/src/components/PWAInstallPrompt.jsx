import { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-fade-in-up">
      <div className="bg-card rounded-xl shadow-2xl border border-border p-4">
        <div className="flex items-start gap-3">
          <img
            src="/pwa-192x192.png"
            alt="Budget Tracker"
            className="w-12 h-12 rounded-xl flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">
              Install Budget Tracker
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add to your home screen for quick access and offline support.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-muted-foreground flex-shrink-0"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-foreground bg-background rounded-lg hover:bg-muted transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
