import { useState, useEffect } from "react";
import { Shield, Phone, Heart, CheckCircle2, Clock } from "lucide-react";
import logo from "@/assets/safehelphublogo.jpg";
import { haptic } from "@/lib/haptics";

const CHECKLIST_ITEMS = [
  "I have taken a few deep breaths",
  "I have access to water or a warm drink",
  "I am aware of my surroundings",
  "I know I can reach out for help anytime",
];

interface SafetyCheckScreenProps {
  onContinue: () => void;
  crisisTimestamp?: number | null;
  cooldownMs?: number;
}

const formatTime = (ms: number) => {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const SafetyCheckScreen = ({ onContinue, crisisTimestamp, cooldownMs = 600000 }: SafetyCheckScreenProps) => {
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST_ITEMS.map(() => false));
  const [safeAnswer, setSafeAnswer] = useState<null | boolean>(null);
  const [remaining, setRemaining] = useState(() => {
    if (!crisisTimestamp) return 0;
    return Math.max(0, cooldownMs - (Date.now() - crisisTimestamp));
  });

  const locked = remaining > 0;

  useEffect(() => {
    if (!crisisTimestamp) return;
    const id = setInterval(() => {
      const left = Math.max(0, cooldownMs - (Date.now() - crisisTimestamp));
      setRemaining(left);
      if (left <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [crisisTimestamp, cooldownMs]);

  const toggleItem = (index: number) => {
    if (locked) return;
    haptic("light");
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const canProceed = !locked && safeAnswer === true;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo & Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-[2px] rounded-2xl mx-auto" style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}>
            <img src={logo} alt="Leevee AI logo" className="w-16 h-16 rounded-[14px] object-cover" />
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

        {/* Countdown Timer with Breathing Exercise */}
        {locked && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center space-y-5 animate-in fade-in duration-500">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Take a moment
              </span>
            </div>

            {/* Breathing circle */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Outer breathing ring */}
                <div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  style={{ animation: "breathe 8s ease-in-out infinite" }}
                />
                {/* Inner breathing ring */}
                <div
                  className="absolute inset-3 rounded-full border border-primary/20"
                  style={{ animation: "breathe 8s ease-in-out infinite 0.3s" }}
                />
                {/* Center glow */}
                <div
                  className="absolute inset-6 rounded-full bg-primary/5"
                  style={{ animation: "breathe 8s ease-in-out infinite 0.6s" }}
                />
                {/* Timer text */}
                <span className="relative text-3xl font-bold text-foreground tracking-wider z-10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {formatTime(remaining)}
                </span>
              </div>
              <p
                className="text-xs font-medium text-primary/70 uppercase tracking-widest"
                style={{ fontFamily: "'Space Grotesk', sans-serif", animation: "breathe-text 8s ease-in-out infinite" }}
              >
                Breathe in… and out…
              </p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              A real person is ready to talk. Please consider calling <span className="font-semibold text-foreground">988</span> before continuing.
            </p>
          </div>
        )}

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
        <div className={`rounded-xl border border-border bg-card p-5 space-y-4 transition-opacity ${locked ? "opacity-40 pointer-events-none" : ""}`}>
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
                  disabled={locked}
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
        <div className={`rounded-xl border border-border bg-card p-5 space-y-4 transition-opacity ${locked ? "opacity-40 pointer-events-none" : ""}`}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Safety Check
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">Are you in a safe place right now?</p>
          <div className="flex gap-3">
            <button
              onClick={() => { if (!locked) { haptic("medium"); setSafeAnswer(true); } }}
              disabled={locked}
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
              onClick={() => { if (!locked) { haptic("heavy"); setSafeAnswer(false); } }}
              disabled={locked}
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
              Continue to Resources
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyCheckScreen;
