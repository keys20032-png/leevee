import { useState, useCallback } from "react";
import { useAuth, type TierKey } from "@/hooks/use-auth";

const DAILY_LIMITS: Record<TierKey, number> = {
  free: 15,
  pro: 100,
  premium: Infinity,
};

const getStorageKey = () => {
  const today = new Date().toISOString().slice(0, 10);
  return `leevee_msg_count_${today}`;
};

const getCount = (): number => {
  try {
    return parseInt(localStorage.getItem(getStorageKey()) || "0", 10);
  } catch {
    return 0;
  }
};

const setCount = (n: number) => {
  try {
    localStorage.setItem(getStorageKey(), String(n));
  } catch {}
};

export const useDailyLimit = () => {
  const { tier, isAdmin } = useAuth();
  const [count, setCountState] = useState(getCount);

  const limit = isAdmin ? Infinity : DAILY_LIMITS[tier];
  const remaining = Math.max(0, limit - count);
  const isAtLimit = !isAdmin && count >= limit;

  const increment = useCallback(() => {
    const next = getCount() + 1;
    setCount(next);
    setCountState(next);
  }, []);

  return { count, limit, remaining, isAtLimit, increment, tier };
};
