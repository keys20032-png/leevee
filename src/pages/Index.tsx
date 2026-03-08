import { useState, useEffect } from "react";
import CrisisBanner from "@/components/CrisisBanner";
import QuickExitButton from "@/components/QuickExitButton";
import SafetyCheckScreen from "@/components/SafetyCheckScreen";
import FullScreenChatbot from "@/components/FullScreenChatbot";

const Index = () => {
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);

  useEffect(() => {
    const wasRedirected = localStorage.getItem("safehub_crisis_redirect");
    if (wasRedirected === "true") {
      setShowSafetyCheck(true);
    }
  }, []);

  const handleSafetyCheckComplete = () => {
    localStorage.removeItem("safehub_crisis_redirect");
    setShowSafetyCheck(false);
  };

  if (showSafetyCheck) {
    return <SafetyCheckScreen onContinue={handleSafetyCheckComplete} />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[100] focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-semibold focus:rounded-br-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <CrisisBanner />
      <QuickExitButton />
      <main id="main-content" role="main" className="flex-1 overflow-hidden">
        <FullScreenChatbot />
      </main>
    </div>
  );
};

export default Index;
