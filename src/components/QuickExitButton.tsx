import { LogOut } from "lucide-react";

const QuickExitButton = () => {
  const handleExit = () => {
    // Replace current history entry so back button won't return here
    window.location.replace("https://www.google.com");
  };

  return (
    <button
      onClick={handleExit}
      className="fixed top-[110px] right-4 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-semibold text-xs tracking-[0.1em] uppercase shadow-lg shadow-destructive/20 hover:opacity-90 transition-all animate-pulse hover:animate-none"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      aria-label="Quick exit - leave this site immediately"
      title="Leave this site quickly"
    >
      <LogOut className="w-4 h-4" />
      Quick Exit
    </button>
  );
};

export default QuickExitButton;
