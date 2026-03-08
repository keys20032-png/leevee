import FullScreenChatbot from "@/components/FullScreenChatbot";
import InstallBanner from "@/components/InstallBanner";

const Index = () => {
  return (
    <div className="h-screen flex flex-col bg-background">
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
