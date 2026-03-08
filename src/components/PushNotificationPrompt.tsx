import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { cn } from "@/lib/utils";

const PushNotificationPrompt = () => {
  const { status, subscribed, loading, subscribe, unsubscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show prompt after 30s if not already subscribed/denied/dismissed
    if (status === "unsupported" || status === "denied" || subscribed) return;
    if (localStorage.getItem("leevee_push_dismissed") === "1") return;

    const timer = setTimeout(() => setShowBanner(true), 30000);
    return () => clearTimeout(timer);
  }, [status, subscribed]);

  const handleEnable = async () => {
    const ok = await subscribe();
    if (ok) setShowBanner(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
    localStorage.setItem("leevee_push_dismissed", "1");
  };

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-500 max-w-sm mx-auto">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-lg shadow-black/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Daily check-in reminders</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Get a gentle nudge to check in with yourself each day.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleEnable} disabled={loading} className="text-xs h-8">
                {loading ? "Enabling…" : "Enable"}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss} className="text-xs h-8 text-muted-foreground">
                Not now
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationPrompt;
