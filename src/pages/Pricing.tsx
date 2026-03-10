import { useState } from "react";
import { useAuth, TIERS, type TierKey } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Check, Sparkles, Zap, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logo from "@/assets/safehubhelp-ai-logo.png";

const PLANS: {
  key: TierKey;
  name: string;
  price: string;
  priceNote: string;
  icon: typeof Sparkles;
  features: string[];
  cta: string;
  highlight?: boolean;
}[] = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    priceNote: "forever",
    icon: Sparkles,
    features: [
      "20 AI chats per day",
      "General & Learn modes",
      "10 memory slots",
      "3 image generations/day",
      "Export & sync",
    ],
    cta: "Current Plan",
  },
  {
    key: "pro",
    name: "Pro",
    price: "$9",
    priceNote: "/month",
    icon: Zap,
    highlight: true,
    features: [
      "Unlimited AI chats",
      "All 7 modes",
      "100 memory slots",
      "20 image generations/day",
      "Export & sync",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
  },
  {
    key: "premium",
    name: "Premium",
    price: "$19",
    priceNote: "/month",
    icon: Crown,
    features: [
      "Everything in Pro",
      "Unlimited memory",
      "Unlimited image generation",
      "Custom AI personas",
      "Priority AI models",
      "Early access to features",
    ],
    cta: "Go Premium",
  },
];

const Pricing = () => {
  const { user, tier, subscribed, refreshSubscription } = useAuth();
  const [loadingTier, setLoadingTier] = useState<TierKey | null>(null);

  const handleCheckout = async (planKey: TierKey) => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    if (planKey === "free") return;

    const priceId = TIERS[planKey].price_id;
    if (!priceId) return;

    setLoadingTier(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e) {
      toast.error("Failed to start checkout. Please try again.");
    }
    setLoadingTier(null);
  };

  const handleManage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      toast.error("Failed to open subscription management.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </a>
          <img src={logo} alt="Leevee" className="w-8 h-8 rounded-xl" />
          <h1 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Pricing
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Choose your plan
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Leevee is free to use. Upgrade for unlimited access, more modes, and premium features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PLANS.map((plan) => {
            const isCurrentTier = tier === plan.key;
            const Icon = plan.icon;
            const isLoading = loadingTier === plan.key;

            return (
              <div
                key={plan.key}
                className={`relative rounded-2xl border p-6 flex flex-col transition-all duration-200 ${
                  plan.highlight
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                } ${isCurrentTier ? "ring-2 ring-primary" : ""}`}
              >
                {plan.highlight && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-primary-foreground"
                    style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}
                  >
                    Most Popular
                  </div>
                )}
                {isCurrentTier && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                    Your Plan
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg ${plan.highlight ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`w-5 h-5 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {plan.name}
                  </h3>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{plan.priceNote}</span>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentTier && subscribed ? (
                  <Button variant="outline" onClick={handleManage} className="w-full">
                    Manage Subscription
                  </Button>
                ) : plan.key === "free" ? (
                  <Button variant="outline" disabled className="w-full">
                    {tier === "free" ? "Current Plan" : "Free Tier"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={isLoading}
                    className={`w-full gap-2 ${
                      plan.highlight
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isLoading ? "Loading..." : plan.cta}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {subscribed && (
          <div className="text-center mt-8">
            <button
              onClick={() => refreshSubscription()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Refresh subscription status
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-12 py-6 text-center text-xs text-muted-foreground">
        <a href="/" className="hover:text-foreground transition-colors">← Back to Leevee</a>
      </footer>
    </div>
  );
};

export default Pricing;
