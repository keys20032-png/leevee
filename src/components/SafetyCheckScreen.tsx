import { useState } from "react";
import { Shield, Phone, Heart, CheckCircle2 } from "lucide-react";
import logo from "@/assets/safehelphublogo.jpg";

const CHECKLIST_ITEMS = [
  "I have taken a few deep breaths",
  "I have access to water or a warm drink",
  "I am aware of my surroundings",
  "I know I can reach out for help anytime",
];

interface SafetyCheckScreenProps {
  onContinue: () => void;
}

const SafetyCheckScreen = ({ onContinue }: SafetyCheckScreenProps) => {
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST_ITEMS.map(() => false));
  const [safeAnswer, setSafeAnswer] = useState<null | boolean>(null);

  const toggleItem = (index: number) => {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const canProceed = safeAnswer === true;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo & Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-[2px] rounded-2xl mx-auto" style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}>
            <img src={logo} alt="Ally logo" className="w-16 h-16 rounded-[14px] object-cover" />
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            Before you continue, let's take a moment to check in with yourself.
          </p>
        </div>

        {/* 988 Crisis Card */}
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Phone className="w-5 h-5 text-destructive" />
            <span className="text-sm font-semibold text-destructive" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              If you are in crisis, call or text
            </span>
          </div>
          <a
            href="tel:988"
            className="inline-block text-4xl font-bold text-destructive hover:underline tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            988
          </a>
          <p className="text-xs text-destructive/80">
            Suicide &amp; Crisis Lifeline — Available 24/7
          </p>
        </div>

        {/* Wellness Checklist */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Wellness Check-In
            </h2>
          </div>
          <ul className="space-y-3">
            {CHECKLIST_ITEMS.map((item, i) => (
              <li key={i}>
                <button
                  onClick={() => toggleItem(i)}
                  className="w-full flex items-center gap-3 text-left group"
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      checked[i]
                        ? "border-primary bg-primary"
                        : "border-border group-hover:border-primary/50"
                    }`}
                  >
                    {checked[i] && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
                  </div>
                  <span className={`text-sm transition-colors ${checked[i] ? "text-foreground" : "text-muted-foreground"}`}>
                    {item}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Safety Question */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Safety Check
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">Are you in a safe place right now?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setSafeAnswer(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold tracking-wide uppercase transition-all ${
                safeAnswer === true
                  ? "text-primary-foreground shadow-lg"
                  : "border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
              style={safeAnswer === true ? { background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" } : { fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Yes, I'm safe
            </button>
            <button
              onClick={() => setSafeAnswer(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold tracking-wide uppercase transition-all ${
                safeAnswer === false
                  ? "bg-destructive text-destructive-foreground shadow-lg"
                  : "border border-border text-muted-foreground hover:border-destructive/40 hover:text-foreground"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              No, I need help
            </button>
          </div>

          {safeAnswer === false && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 space-y-2 animate-in fade-in duration-300">
              <p className="text-sm font-semibold text-destructive">Please reach out now:</p>
              <p className="text-sm text-destructive/90">
                Call or text <a href="tel:988" className="font-bold underline">988</a> to speak with someone who can help. You are not alone.
              </p>
              <p className="text-xs text-destructive/70 mt-1">
                You can also text HOME to <span className="font-semibold">741741</span> (Crisis Text Line)
              </p>
            </div>
          )}
        </div>

        {/* Continue Button */}
        {canProceed && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={onContinue}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-primary-foreground text-sm font-semibold tracking-wide uppercase transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Continue to Ally
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyCheckScreen;
