import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare, Flame, GraduationCap, PartyPopper,
  PenTool, Swords, ImageIcon, Shield, ArrowRight,
  ArrowLeft, Heart, Sparkles, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ChatMode = "default" | "vent" | "academic" | "fun" | "creative" | "debate" | "image";

const MODES: { key: ChatMode; label: string; icon: typeof MessageSquare; emoji: string; desc: string; gradient: string }[] = [
  { key: "default", label: "General", icon: MessageSquare, emoji: "💭", desc: "Think out loud, get advice, brainstorm", gradient: "from-primary to-accent" },
  { key: "vent", label: "Vent", icon: Flame, emoji: "🫂", desc: "Safe space to let it all out", gradient: "from-red-500 to-orange-600" },
  { key: "academic", label: "Learn", icon: GraduationCap, emoji: "🧠", desc: "Study, explore, understand", gradient: "from-blue-500 to-cyan-500" },
  { key: "fun", label: "Play", icon: PartyPopper, emoji: "✨", desc: "Games, jokes, good vibes", gradient: "from-yellow-500 to-orange-500" },
  { key: "creative", label: "Create", icon: PenTool, emoji: "🎨", desc: "Write, imagine, make art", gradient: "from-purple-500 to-pink-500" },
  { key: "debate", label: "Debate", icon: Swords, emoji: "⚡", desc: "Sharpen your thinking", gradient: "from-amber-500 to-red-500" },
  { key: "image", label: "Imagine", icon: ImageIcon, emoji: "🖼️", desc: "Generate images from words", gradient: "from-emerald-500 to-teal-500" },
];

const SAFETY_FEATURES = [
  { icon: Shield, title: "Crisis Support", desc: "If you're in crisis, we'll connect you with real help like 988 Lifeline instantly." },
  { icon: Heart, title: "Safety Plan", desc: "A personalized safety plan you can fill out and access anytime." },
  { icon: Sparkles, title: "Quick Exit", desc: "One tap to instantly leave the app if you need to." },
];

interface OnboardingFlowProps {
  onComplete: (prefs: { displayName: string; preferredMode: ChatMode }) => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [preferredMode, setPreferredMode] = useState<ChatMode>("default");

  const totalSteps = 4;

  const handleFinish = () => {
    onComplete({ displayName: displayName.trim() || "Friend", preferredMode });
  };

  return (
    <div className="h-dvh flex flex-col bg-background text-foreground overflow-hidden">
      {/* Progress bar */}
      <div className="flex gap-1.5 px-6 pt-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-500",
              i <= step ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-6xl">👋</div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to Leevee</h1>
            <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
              Your AI companion for thinking, venting, learning, and creating — in a safe, judgment-free space.
            </p>
          </div>
        )}

        {/* Step 1: Chat Modes */}
        {step === 1 && (
          <div className="flex-1 flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold">Choose how you chat</h2>
              <p className="text-muted-foreground mt-1">7 modes, each with its own personality. Pick your favorite to start.</p>
            </div>
            <div className="grid gap-2.5">
              {MODES.map((m) => {
                const Icon = m.icon;
                const selected = preferredMode === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => setPreferredMode(m.key)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                      selected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border bg-card hover:bg-secondary"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br text-primary-foreground shrink-0", m.gradient)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium flex items-center gap-1.5">
                        {m.emoji} {m.label}
                        {selected && <Check className="w-4 h-4 text-primary ml-auto" />}
                      </div>
                      <div className="text-xs text-muted-foreground">{m.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Safety Features */}
        {step === 2 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Your safety matters</h2>
              <p className="text-muted-foreground mt-1">Built-in protections, always on.</p>
            </div>
            <div className="w-full max-w-sm flex flex-col gap-4">
              {SAFETY_FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                    <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{f.title}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{f.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Crisis detection only activates when <span className="font-medium text-foreground">you type</span> something that signals real distress — never from suggested prompts or onboarding content.
            </p>
          </div>
        )}

        {/* Step 3: Display Name */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-5xl">✨</div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">What should I call you?</h2>
              <p className="text-muted-foreground mt-1">Totally optional. You can change it later.</p>
            </div>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name or nickname"
              className="max-w-xs text-center text-lg h-12"
              maxLength={30}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 pb-6 pt-2 flex items-center gap-3">
        {step > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        )}
        <div className="flex-1" />
        {step < totalSteps - 1 ? (
          <Button onClick={() => setStep(step + 1)} className="gap-1.5">
            {step === 0 ? "Get Started" : "Next"} <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleFinish} className="gap-1.5">
            Let's go! <Sparkles className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
