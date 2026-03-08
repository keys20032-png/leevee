import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export const TIERS = {
  free: { name: "Free", product_id: null, price_id: null },
  pro: { name: "Pro", product_id: "prod_U71eV1jc6hNgbJ", price_id: "price_1T8nbdIkHNCRAPpnY3NbnRyl" },
  premium: { name: "Premium", product_id: "prod_U71fAq9qBAWFSL", price_id: "price_1T8nc9IkHNCRAPpniAMKDsBC" },
} as const;

export type TierKey = keyof typeof TIERS;

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: { display_name: string; avatar_url: string | null } | null;
  tier: TierKey;
  subscribed: boolean;
  subscriptionEnd: string | null;
  checkingSubscription: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profile: null,
  tier: "free",
  subscribed: false,
  subscriptionEnd: null,
  checkingSubscription: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  refreshSubscription: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ display_name: string; avatar_url: string | null } | null>(null);
  const [tier, setTier] = useState<TierKey>("free");
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", userId)
      .single();
    if (data) setProfile(data);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const checkSubscription = async () => {
    try {
      setCheckingSubscription(true);
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error || !data) {
        setTier("free");
        setSubscribed(false);
        setSubscriptionEnd(null);
        return;
      }
      setSubscribed(data.subscribed || false);
      setSubscriptionEnd(data.subscription_end || null);

      if (data.subscribed && data.product_id) {
        if (data.product_id === TIERS.premium.product_id) setTier("premium");
        else if (data.product_id === TIERS.pro.product_id) setTier("pro");
        else setTier("free");
      } else {
        setTier("free");
      }
    } catch {
      setTier("free");
      setSubscribed(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const refreshSubscription = async () => {
    await checkSubscription();
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id), 0);
          setTimeout(() => checkSubscription(), 100);
        } else {
          setProfile(null);
          setTier("free");
          setSubscribed(false);
          setSubscriptionEnd(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        checkSubscription();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Refresh subscription every 60s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setTier("free");
    setSubscribed(false);
    setSubscriptionEnd(null);
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading, profile,
      tier, subscribed, subscriptionEnd, checkingSubscription,
      signOut, refreshProfile, refreshSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
