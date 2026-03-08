import { useState, useEffect } from "react";
import { Download, Smartphone, CheckCircle2, Share, MoreVertical } from "lucide-react";
import logo from "@/assets/safehelphublogo.jpg";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo */}
        <div className="inline-flex p-[2px] rounded-2xl mx-auto" style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}>
          <img src={logo} alt="Ally logo" className="w-20 h-20 rounded-[14px] object-cover" />
        </div>

        <div className="space-y-3">
          <h1
            className="text-3xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Install Ally
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            Add Ally to your home screen for quick access to resources anytime you need them.
          </p>
        </div>

        {isInstalled ? (
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-6 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
            <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Already Installed!
            </p>
            <p className="text-xs text-muted-foreground">
              Ally is on your home screen. Open it anytime.
            </p>
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-primary-foreground text-sm font-semibold tracking-wide uppercase transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Download className="w-5 h-5" />
            Install App
          </button>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <Smartphone className="w-10 h-10 text-primary mx-auto" />
            <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              How to Install
            </p>
            {isIOS ? (
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tap the <Share className="w-4 h-4 inline text-primary" /> <span className="font-medium text-foreground">Share</span> button in Safari
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scroll down and tap <span className="font-medium text-foreground">"Add to Home Screen"</span>
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tap <span className="font-medium text-foreground">"Add"</span> to confirm
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tap the <MoreVertical className="w-4 h-4 inline text-primary" /> <span className="font-medium text-foreground">menu</span> in your browser
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tap <span className="font-medium text-foreground">"Install app"</span> or <span className="font-medium text-foreground">"Add to Home Screen"</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          {[
            { icon: "⚡", label: "Fast access" },
            { icon: "📴", label: "Works offline" },
            { icon: "🔒", label: "Private & safe" },
          ].map((f) => (
            <div key={f.label} className="rounded-xl border border-border bg-card/50 p-3 space-y-1">
              <span className="text-lg">{f.icon}</span>
              <p className="text-xs text-muted-foreground">{f.label}</p>
            </div>
          ))}
        </div>

        <a
          href="/"
          className="inline-block text-xs text-muted-foreground hover:text-primary transition-colors underline"
        >
          Back to Ally
        </a>
      </div>
    </div>
  );
};

export default Install;
