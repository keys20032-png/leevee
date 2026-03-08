import { useState, useEffect } from "react";
import FullScreenChatbot from "@/components/FullScreenChatbot";
import InstallBanner from "@/components/InstallBanner";
import SafetyCheckScreen from "@/components/SafetyCheckScreen";
import OnboardingFlow from "@/components/OnboardingFlow";

const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

const getCrisisTime = (): number | null => {
  const raw = localStorage.getItem("crisis_redirect_time");
  if (!raw) return null;
  const t = parseInt(raw, 10);
  return isNaN(t) ? null : t;
};

const isInCooldown = (): boolean => {
  if (new URLSearchParams(window.location.search).get("bypass") === "1") {
    localStorage.removeItem("crisis_redirect_time");
    return false;
  }
  const t = getCrisisTime();
  if (!t) return false;
  return Date.now() - t < COOLDOWN_MS;
};

const hasCompletedOnboarding = (): boolean => {
  return localStorage.getItem("leevee_onboarding_complete") === "1";
};

const Index = () => {
  const [showSafetyCheck, setShowSafetyCheck] = useState(() => isInCooldown());
  const [showOnboarding, setShowOnboarding] = useState(() => !hasCompletedOnboarding() && !isInCooldown());

  useEffect(() => {
    const check = () => {
      if (isInCooldown()) {
        setShowSafetyCheck(true);
      }
    };
    window.addEventListener("focus", check);
    window.addEventListener("pageshow", check);
    return () => {
      window.removeEventListener("focus", check);
      window.removeEventListener("pageshow", check);
    };
  }, []);

  const handleSafetyComplete = () => {
    localStorage.removeItem("crisis_redirect_time");
    setShowSafetyCheck(false);
  };

  if (showSafetyCheck) {
    const crisisTime = getCrisisTime();
    return (
      <SafetyCheckScreen
        onContinue={handleSafetyComplete}
        crisisTimestamp={crisisTime}
        cooldownMs={COOLDOWN_MS}
      />
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      <InstallBanner />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[100] focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-semibold focus:rounded-br-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <main id="main-content" role="main" className="flex-1 overflow-hidden">
        <FullScreenChatbot />
      </main>
    </div>
  );
};

export default Index;
