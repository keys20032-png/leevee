import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/i18n/I18nContext";
import { usePwaUpdate } from "@/hooks/use-pwa-update";
import Index from "./pages/Index";
import CrisisResources from "./pages/CrisisResources";
import SexWorkEducation from "./pages/SexWorkEducation";
import SafetyDocumentation from "./pages/SafetyDocumentation";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Install from "./pages/Install";
import AIWebDeveloperVision from "./pages/AIWebDeveloperVision";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  usePwaUpdate();
  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/crisis-resources" element={<CrisisResources />} />
          <Route path="/sex-work-education" element={<SexWorkEducation />} />
          <Route path="/safety" element={<SafetyDocumentation />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/install" element={<Install />} />
          <Route path="/vision/ai-web-developer" element={<AIWebDeveloperVision />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
