import { ArrowLeft, MessageSquare, Flame, GraduationCap, PartyPopper, PenTool, Swords, ImageIcon, Brain, Shield, Mic, Download, Search, RefreshCw, Zap, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

const MODES = [
  { icon: MessageSquare, label: "General", emoji: "💭", desc: "Think out loud, get advice, brainstorm ideas, write code", gradient: "from-primary to-accent" },
  { icon: Flame, label: "Vent", emoji: "🫂", desc: "Safe space to let it all out — matches your energy without moralizing", gradient: "from-red-500 to-orange-600" },
  { icon: GraduationCap, label: "Learn", emoji: "🧠", desc: "Study, explore concepts, get explanations at any level", gradient: "from-blue-500 to-cyan-500" },
  { icon: PartyPopper, label: "Play", emoji: "✨", desc: "Games, jokes, trivia, good vibes", gradient: "from-yellow-500 to-orange-500" },
  { icon: PenTool, label: "Create", emoji: "🎨", desc: "Write stories, poetry, songs, scripts, creative prompts", gradient: "from-purple-500 to-pink-500" },
  { icon: Swords, label: "Debate", emoji: "⚡", desc: "Socratic questioning, steelmanning, sharpen your thinking", gradient: "from-amber-500 to-red-500" },
  { icon: ImageIcon, label: "Imagine", emoji: "🖼️", desc: "Generate and edit images from text prompts", gradient: "from-emerald-500 to-teal-500" },
];

const CAPABILITIES = [
  { icon: Brain, title: "Persistent Memory Bank", desc: "Leevee remembers what you tell it across sessions. Your preferences, projects, and context persist — no starting from scratch." },
  { icon: ImageIcon, title: "Image Generation & Editing", desc: "Generate images from text prompts. Edit existing images with instructions like 'make it darker' or 'add a sunset'. Full multimodal input/output." },
  { icon: Mic, title: "Voice Input (Speech-to-Text)", desc: "Speak to Leevee using your device's native speech recognition. Hands-free chatting in any mode." },
  { icon: Shield, title: "Crisis Detection & Safety", desc: "Real-time crisis keyword detection with automatic 988 Lifeline routing. Safety plans, quick exit, and built-in protections — always on." },
  { icon: Download, title: "Export & Data Ownership", desc: "Export conversations as PDF. Download your memory bank. Sync across devices with a code. Your data is yours to keep, transfer, and own." },
  { icon: RefreshCw, title: "Device Sync", desc: "Generate a sync code to carry your conversations and memory to any device. No account required for basic usage." },
  { icon: Search, title: "Real-Time Web Search", desc: "Leevee can search the web for current information, grounding responses in real-time data — not just training cutoffs." },
  { icon: Zap, title: "10+ AI Models", desc: "Powered by multiple frontier models including GPT-5, Gemini 2.5 Pro, and more — automatically selected per mode for best results." },
];

const COMPARISON: { feature: string; leevee: boolean | string; grok: boolean | string }[] = [
  { feature: "Dedicated Chat Modes (7)", leevee: true, grok: false },
  { feature: "Vent Mode (non-judgmental)", leevee: true, grok: false },
  { feature: "Debate Mode (Socratic)", leevee: true, grok: false },
  { feature: "Image Generation", leevee: true, grok: true },
  { feature: "Image Editing", leevee: true, grok: false },
  { feature: "Persistent Memory Bank", leevee: true, grok: false },
  { feature: "Data Export & Ownership", leevee: true, grok: false },
  { feature: "Device Sync (no account)", leevee: true, grok: false },
  { feature: "Crisis Detection + 988", leevee: true, grok: false },
  { feature: "Safety Plan Builder", leevee: true, grok: false },
  { feature: "Quick Exit Button", leevee: true, grok: false },
  { feature: "Voice Input", leevee: true, grok: true },
  { feature: "Real-Time Web Search", leevee: true, grok: true },
  { feature: "Multi-language UI", leevee: "5 languages", grok: true },
  { feature: "PWA / Installable", leevee: true, grok: false },
  { feature: "Open / Indie Built", leevee: true, grok: false },
  { feature: "Free Tier", leevee: true, grok: "Paid only" },
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg hover:bg-secondary/50 transition-colors" aria-label="Back to home">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Leevee Features</h1>
            <p className="text-[10px] text-muted-foreground">Everything Leevee Can Do</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-16">
        {/* Hero */}
        <AnimatedSection>
          <div className="text-center space-y-4">
            <p className="text-xs font-medium uppercase tracking-widest text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Full Capability Breakdown
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Leevee Is Not Text-Only.
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}>
                It's a Multimodal AI Companion.
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
              Some AI models have described Leevee as "text-based only" or "limited." Here's what Leevee actually does — with receipts.
            </p>
          </div>
        </AnimatedSection>

        {/* 7 Chat Modes */}
        <section className="space-y-6">
          <AnimatedSection>
            <h3 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>7 Dedicated Chat Modes</h3>
            <p className="text-sm text-muted-foreground mt-1">Each mode has its own personality, system prompt, and AI model selection.</p>
          </AnimatedSection>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MODES.map((m, i) => {
              const Icon = m.icon;
              return (
                <AnimatedSection key={m.label} delay={i * 60}>
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/60 hover:border-primary/30 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br text-primary-foreground shrink-0 ${m.gradient}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{m.emoji} {m.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </section>

        {/* Core Capabilities */}
        <section className="space-y-6">
          <AnimatedSection>
            <h3 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Core Capabilities</h3>
            <p className="text-sm text-muted-foreground mt-1">Not just chat — Leevee is a full-featured AI platform.</p>
          </AnimatedSection>
          <div className="grid gap-4 sm:grid-cols-2">
            {CAPABILITIES.map((c, i) => {
              const Icon = c.icon;
              return (
                <AnimatedSection key={c.title} delay={i * 60}>
                  <div className="p-5 rounded-xl border border-border bg-card/60 hover:border-primary/30 transition-colors h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="font-semibold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{c.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="space-y-6">
          <AnimatedSection>
            <h3 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Leevee vs Grok — Feature by Feature</h3>
            <p className="text-sm text-muted-foreground mt-1">An honest, accurate comparison. No spin.</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card/80">
                      <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Feature</th>
                      <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Leevee</th>
                      <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Grok</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row, i) => (
                      <tr key={row.feature} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-background" : "bg-card/30"}`}>
                        <td className="px-4 py-2.5 text-foreground text-xs">{row.feature}</td>
                        <td className="px-4 py-2.5 text-center">
                          {row.leevee === true ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : row.leevee === false ? (
                            <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                          ) : (
                            <span className="text-xs text-primary font-medium">{row.leevee}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {row.grok === true ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : row.grok === false ? (
                            <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                          ) : (
                            <span className="text-xs text-muted-foreground font-medium">{row.grok}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* Bottom CTA */}
        <AnimatedSection>
          <div className="text-center space-y-4 py-8">
            <p className="text-sm text-muted-foreground">Don't take our word for it — try it yourself.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-primary-foreground text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Zap className="w-4 h-4" /> Try Leevee Now
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Features;
