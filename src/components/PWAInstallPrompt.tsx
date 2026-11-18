import { useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      {!isOnline && (
        <div
          role="status"
          className="no-print fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl border border-[#ff9f43]/40 bg-[#14163a] px-3.5 py-2 text-xs font-semibold text-white shadow-lg"
        >
          <WifiOff className="h-3.5 w-3.5 text-[#ff9f43]" aria-hidden="true" />
          <span>Offline mode — cached data active</span>
        </div>
      )}

      {!isInstalled && !dismissed && (isInstallable || isAndroid || isIOS) && (
        <div className="no-print fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 p-2.5 pl-3.5 text-xs shadow-[0_18px_40px_-10px_rgba(0,0,0,0.65)] backdrop-blur-md">
          {isInstallable ? (
            <button
              type="button"
              onClick={() => void install()}
              className="inline-flex min-h-[38px] items-center gap-2 rounded-xl bg-[var(--btn-cobalt)] px-3.5 py-1.5 font-semibold text-white hover:bg-[var(--btn-cobalt-hover)] transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Install CREATDEV app</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="inline-flex min-h-[38px] items-center gap-2 rounded-xl bg-[var(--btn-cobalt)] px-3.5 py-1.5 font-semibold text-white hover:bg-[var(--btn-cobalt-hover)] transition-colors cursor-pointer"
            >
              <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isIOS ? 'Install on iOS' : 'Install on Android'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss install prompt"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] cursor-pointer"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-guide-title"
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-6 text-[var(--text-main)] shadow-2xl">
            <h2 id="install-guide-title" className="font-display text-lg font-bold">
              {isIOS ? 'Install CREATDEV on iPhone / iPad' : 'Install CREATDEV on Android'}
            </h2>
            {isIOS ? (
              <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-[var(--text-muted)]">
                <li>Tap the Share button in Safari’s toolbar.</li>
                <li>Scroll down and choose Add to Home Screen.</li>
                <li>Tap Add to launch CREATDEV like a native app.</li>
              </ol>
            ) : (
              <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-[var(--text-muted)]">
                <li>Open CREATDEV in Google Chrome on your Android phone.</li>
                <li>Tap the browser menu (three dots) in the top right.</li>
                <li>Select Install app or Add to Home screen to install directly.</li>
              </ol>
            )}
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 min-h-[42px] w-full rounded-xl bg-[var(--btn-ink)] px-4 py-2 text-sm font-semibold text-[var(--btn-ink-text)] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
