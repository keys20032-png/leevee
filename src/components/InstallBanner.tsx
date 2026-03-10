import { useState, useEffect } from "react";
import { X, Download, Share, MoreVertical } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("install-banner-dismissed")) {
      setDismissed(true);
      return;
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("install-banner-dismissed", "true");
  };

  if (isInstalled || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-[60] mx-auto max-w-md animate-in slide-in-from-bottom-4 duration-500" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/10 p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}
          >
            <Download className="w-5 h-5 text-primary-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Install Leevee AI
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add to your home screen for quick, offline access.
            </p>

            {showTips && (
              <div className="mt-3 space-y-2 text-xs text-muted-foreground border-t border-border/50 pt-3">
                {isIOS ? (
                  <>
                    <p className="flex items-center gap-2">
                      <Share className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      Tap <span className="font-medium text-foreground">Share</span> in Safari
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 text-primary flex-shrink-0 text-center font-bold">+</span>
                      Tap <span className="font-medium text-foreground">"Add to Home Screen"</span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="flex items-center gap-2">
                      <MoreVertical className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      Tap <span className="font-medium text-foreground">browser menu</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      Tap <span className="font-medium text-foreground">"Install app"</span>
                    </p>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              {deferredPrompt ? (
                <button
                  onClick={handleInstall}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Install
                </button>
              ) : (
                <button
                  onClick={() => setShowTips(!showTips)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {showTips ? "Hide tips" : "How to install"}
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Not now
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;
