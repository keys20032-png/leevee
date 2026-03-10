import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = "BAJTok5Y-MakqT9Pn0rDW12Ftk_ELpyaPTgoCFpA5sGiuSc-hFPZK4jG7XDuFfaSXBdmSfMO0quD_Rje6bj9RFQ";

function getSessionId(): string {
  let id = localStorage.getItem("leevee_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("leevee_session_id", id);
  }
  return id;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export type PushStatus = "default" | "granted" | "denied" | "unsupported";

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>("default");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus(Notification.permission as PushStatus);
    // Check existing subscription
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    });
  }, []);

  const subscribe = useCallback(async () => {
    if (status === "unsupported" || status === "denied") return false;
    setLoading(true);
    try {
      // Register push SW
      await navigator.serviceWorker.register("/sw-push.js", { scope: "/" });
      const reg = await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      setStatus(permission as PushStatus);
      if (permission !== "granted") return false;

      const sub = await reg.pushManager.subscribe({
        userAgentPublicKey: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      } as any);

      const subJson = sub.toJSON();
      const sessionId = getSessionId();
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("push_subscriptions").upsert({
        session_id: sessionId,
        user_id: user?.id || null,
        endpoint: subJson.endpoint!,
        p256dh: subJson.keys!.p256dh!,
        auth: subJson.keys!.auth!,
      }, { onConflict: "endpoint" });

      setSubscribed(true);
      localStorage.setItem("leevee_push_enabled", "1");
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [status]);

  const unsubscribe = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
      }
      setSubscribed(false);
      localStorage.removeItem("leevee_push_enabled");
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    }
  }, []);

  return { status, subscribed, loading, subscribe, unsubscribe };
}
