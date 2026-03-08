import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import ResourcesSection from "@/components/ResourcesSection";
import AboutSection from "@/components/AboutSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import AIChatbot from "@/components/AIChatbot";
import CrisisBanner from "@/components/CrisisBanner";
import QuickExitButton from "@/components/QuickExitButton";
import ContactForm from "@/components/ContactForm";
import SafetyCheckScreen from "@/components/SafetyCheckScreen";

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
    <div className="min-h-screen bg-background">
      {/* Skip to content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[100] focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-semibold focus:rounded-br-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <CrisisBanner />
      <Navbar />
      <QuickExitButton />
      <main id="main-content" role="main">
        <HeroSection />
        <StatsSection />
        {/* <ResourcesSection /> */}
        <ContactForm />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
};

export default Index;
