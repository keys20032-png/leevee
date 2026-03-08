import { useEffect } from "react";

const IDLE_TIMEOUT = 60_000; // 1 minute of inactivity
const CHECK_INTERVAL = 5 * 60_000; // Check for updates every 5 minutes

export function usePwaUpdate() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let idleTimer: ReturnType<typeof setTimeout>;
    let checkTimer: ReturnType<typeof setInterval>;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        // User is idle — check for SW update and reload if available
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg?.waiting) {
            reg.waiting.postMessage({ type: "SKIP_WAITING" });
            window.location.reload();
          }
        });
      }, IDLE_TIMEOUT);
    };

    // Listen for new service worker ready to activate
    let refreshing = false;
    const onControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    // Periodically check for updates
    checkTimer = setInterval(() => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.update();
      });
    }, CHECK_INTERVAL);

    // Track user activity
    const events = ["mousemove", "keydown", "touchstart", "scroll", "click"];
    events.forEach((e) => document.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      clearInterval(checkTimer);
      events.forEach((e) => document.removeEventListener(e, resetIdleTimer));
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);
}
