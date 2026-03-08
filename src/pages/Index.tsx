import { useState, useEffect } from "react";
import FullScreenChatbot from "@/components/FullScreenChatbot";
import InstallBanner from "@/components/InstallBanner";
import SafetyCheckScreen from "@/components/SafetyCheckScreen";

const Index = () => {
  const [showSafetyCheck, setShowSafetyCheck] = useState(() => {
    const flag = localStorage.getItem("crisis_redirect");
    return flag === "true";
  });

  // Also listen for storage changes (e.g., flag set in same tab before redirect)
  useEffect(() => {
    const check = () => {
      if (localStorage.getItem("crisis_redirect") === "true") {
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
    localStorage.removeItem("crisis_redirect");
    setShowSafetyCheck(false);
  };

  if (showSafetyCheck) {
    return <SafetyCheckScreen onContinue={handleSafetyComplete} />;
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
