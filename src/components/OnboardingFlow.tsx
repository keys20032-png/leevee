import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare, Flame, GraduationCap, PartyPopper,
  PenTool, Swords, ImageIcon, Shield, ArrowRight,
  ArrowLeft, Heart, Sparkles, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";

type ChatMode = "default" | "vent" | "academic" | "fun" | "creative" | "debate" | "image" | "drama";

interface OnboardingFlowProps {
  onComplete: (prefs: { displayName: string; preferredMode: ChatMode }) => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [preferredMode, setPreferredMode] = useState<ChatMode>("default");

  const totalSteps = 4;

  const MODES = useMemo(() => [
    { key: "default" as ChatMode, label: t.home.modeGeneral, icon: MessageSquare, emoji: "💭", desc: t.onboarding.modeDescGeneral, gradient: "from-primary to-accent" },
    { key: "vent" as ChatMode, label: t.home.modeVent, icon: Flame, emoji: "🫂", desc: t.onboarding.modeDescVent, gradient: "from-red-500 to-orange-600" },
    { key: "academic" as ChatMode, label: t.home.modeLearn, icon: GraduationCap, emoji: "🧠", desc: t.onboarding.modeDescLearn, gradient: "from-blue-500 to-cyan-500" },
    { key: "fun" as ChatMode, label: t.home.modePlay, icon: PartyPopper, emoji: "✨", desc: t.onboarding.modeDescPlay, gradient: "from-yellow-500 to-orange-500" },
    { key: "creative" as ChatMode, label: t.home.modeCreate, icon: PenTool, emoji: "🎨", desc: t.onboarding.modeDescCreate, gradient: "from-purple-500 to-pink-500" },
    { key: "debate" as ChatMode, label: t.home.modeDebate, icon: Swords, emoji: "⚡", desc: t.onboarding.modeDescDebate, gradient: "from-amber-500 to-red-500" },
    { key: "image" as ChatMode, label: t.home.modeImagine, icon: ImageIcon, emoji: "🖼️", desc: t.onboarding.modeDescImagine, gradient: "from-emerald-500 to-teal-500" },
    { key: "drama" as ChatMode, label: t.home.modeDrama, icon: Flame, emoji: "💅", desc: t.onboarding.modeDescDrama, gradient: "from-pink-500 to-rose-600" },
  ], [t]);

  const SAFETY_FEATURES = useMemo(() => [
    { icon: Shield, title: t.onboarding.crisisSupportTitle, desc: t.onboarding.crisisSupportDesc },
    { icon: Heart, title: t.onboarding.safetyPlanTitle, desc: t.onboarding.safetyPlanDesc },
  ], [t]);

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
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-3xl opacity-20 animate-pulse-ring" style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }} />
              <div className="text-7xl relative">👋</div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.onboarding.welcomeTitle}</h1>
            <p className="text-muted-foreground max-w-md text-lg leading-relaxed text-balance">
              {t.onboarding.welcomeDesc}
            </p>
          </div>
        )}

        {/* Step 1: Chat Modes */}
        {step === 1 && (
          <div className="flex-1 flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold">{t.onboarding.chooseMode}</h2>
              <p className="text-muted-foreground mt-1">{t.onboarding.chooseModeDesc}</p>
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
              <h2 className="text-2xl font-bold">{t.onboarding.safetyTitle}</h2>
              <p className="text-muted-foreground mt-1">{t.onboarding.safetyDesc}</p>
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
              {t.onboarding.crisisNote.split(t.onboarding.crisisNoteYouType)[0]}
              <span className="font-medium text-foreground">{t.onboarding.crisisNoteYouType}</span>
              {t.onboarding.crisisNote.split(t.onboarding.crisisNoteYouType)[1]}
            </p>
          </div>
        )}

        {/* Step 3: Display Name */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-5xl">✨</div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{t.onboarding.nameTitle}</h2>
              <p className="text-muted-foreground mt-1">{t.onboarding.nameDesc}</p>
            </div>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t.onboarding.namePlaceholder}
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
            <ArrowLeft className="w-4 h-4 mr-1" /> {t.onboarding.back}
          </Button>
        )}
        <div className="flex-1" />
        {step < totalSteps - 1 ? (
          <Button onClick={() => setStep(step + 1)} className="gap-1.5">
            {step === 0 ? t.onboarding.getStarted : t.onboarding.next} <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleFinish} className="gap-1.5">
            {t.onboarding.letsGo} <Sparkles className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
