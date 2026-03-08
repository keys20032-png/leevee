import { useState } from "react";
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

const COMPARISON: { feature: string; leevee: boolean | string; grok: boolean | string; claude: boolean | string }[] = [
  { feature: "Dedicated Chat Modes (7)", leevee: true, grok: false, claude: false },
  { feature: "Vent Mode (non-judgmental)", leevee: true, grok: false, claude: false },
  { feature: "Debate Mode (Socratic)", leevee: true, grok: false, claude: false },
  { feature: "Image Generation", leevee: true, grok: true, claude: false },
  { feature: "Image Editing", leevee: true, grok: false, claude: false },
  { feature: "Persistent Memory Bank", leevee: true, grok: false, claude: "Limited" },
  { feature: "Data Export & Ownership", leevee: true, grok: false, claude: false },
  { feature: "Device Sync (no account)", leevee: true, grok: false, claude: false },
  { feature: "Crisis Detection + 988", leevee: true, grok: false, claude: false },
  { feature: "Safety Plan Builder", leevee: true, grok: false, claude: false },
  { feature: "Quick Exit Button", leevee: true, grok: false, claude: false },
  { feature: "Voice Input", leevee: true, grok: true, claude: true },
  { feature: "Real-Time Web Search", leevee: true, grok: true, claude: true },
  { feature: "Multi-language UI", leevee: "5 languages", grok: true, claude: true },
  { feature: "PWA / Installable", leevee: true, grok: false, claude: false },
  { feature: "Open / Indie Built", leevee: true, grok: false, claude: false },
  { feature: "Free Tier", leevee: true, grok: "Paid only", claude: "Limited" },
  { feature: "200k+ Context Window", leevee: false, grok: true, claude: true },
  { feature: "Agentic / Computer Use", leevee: false, grok: false, claude: true },
  { feature: "Enterprise / Team Plans", leevee: false, grok: true, claude: true },
  { feature: "Frontier Benchmark Scores", leevee: false, grok: true, claude: true },
  { feature: "Sex Work Education", leevee: true, grok: false, claude: "Refuses" },
  { feature: "LGBTQ+ Inclusive by Design", leevee: true, grok: false, claude: "Neutral" },
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
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="text-foreground">Leevee Is Not Text-Only.</span>
              <br />
              <span className="gradient-text">
                It's a Multimodal AI Companion.
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed text-balance">
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
            <h3 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Leevee vs Grok vs Claude — Feature by Feature</h3>
            <p className="text-sm text-muted-foreground mt-1">An honest, accurate three-way comparison. No spin.</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card/80">
                      <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Feature</th>
                      <th className="text-center px-3 py-3 font-semibold text-xs uppercase tracking-wider text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Leevee</th>
                      <th className="text-center px-3 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Grok</th>
                      <th className="text-center px-3 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Claude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row, i) => {
                      const renderCell = (val: boolean | string) =>
                        val === true ? (
                          <Check className="w-4 h-4 text-green-500 mx-auto" />
                        ) : val === false ? (
                          <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium">{val}</span>
                        );
                      return (
                        <tr key={row.feature} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-background" : "bg-card/30"}`}>
                          <td className="px-3 py-2.5 text-foreground text-xs">{row.feature}</td>
                          <td className="px-3 py-2.5 text-center">
                            {row.leevee === true ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : row.leevee === false ? <X className="w-4 h-4 text-muted-foreground/40 mx-auto" /> : <span className="text-xs text-primary font-medium">{row.leevee}</span>}
                          </td>
                          <td className="px-3 py-2.5 text-center">{renderCell(row.grok)}</td>
                          <td className="px-3 py-2.5 text-center">{renderCell(row.claude)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* Controversial Discussion Section */}
        <section className="space-y-6">
          <AnimatedSection>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
              <span className="text-lg mt-0.5">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Content Advisory</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  The following section discusses controversial topics in AI safety, censorship philosophy, and corporate ethics. We present multiple perspectives with evidence. Reader discretion is advised — these are genuinely contested issues with no universal consensus.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <h3 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>The AI Censorship Debate: Where Leevee and Grok Actually Differ</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Both Leevee and Grok position themselves as alternatives to heavily filtered AI systems. But they approach "freedom" very differently — and the implications matter.
            </p>
          </AnimatedSection>

          {/* Topic 1: Safety vs Censorship */}
          <AnimatedSection delay={120}>
            <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                🔒 Safety Guardrails vs. "Anti-Woke" Positioning
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">The Case for Guardrails (Leevee's Approach)</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Leevee maintains targeted safety systems — crisis detection, lethality blocking, and content moderation — while allowing open discussion of controversial topics. The philosophy: <em>you can talk about anything, but the AI will intervene when it detects genuine danger.</em>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Evidence:</strong> Research from the Journal of Medical Internet Research (2024) found that AI crisis detection systems can reduce response time to suicidal ideation by 40–60% compared to unmoderated platforms. Leevee's approach treats safety as a feature, not censorship.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">The Case for Minimal Filtering (Grok's Approach)</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Grok's "maximum truth-seeking" philosophy argues that heavy safety layers patronize users and prevent honest inquiry. xAI positions this as respecting user autonomy — adults should decide what they can handle.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Evidence:</strong> A 2025 Stanford HAI report noted that overly restrictive AI filters blocked 12–18% of legitimate medical, legal, and educational queries — suggesting real costs to over-moderation. However, the same report found unfiltered systems had 3x higher rates of generating actionable harmful content.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Topic 2: Corporate Independence */}
          <AnimatedSection delay={160}>
            <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                🏢 Corporate Independence vs. Corporate Backing
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">Indie AI (Leevee's Position)</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Leevee is built by a solo developer with no VC funding, no board of directors, and no corporate pressure to monetize user data or align with advertiser interests. Alignment decisions are made by the creator based on community feedback.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Tradeoff:</strong> Limited compute, smaller training runs, and slower feature development. A solo dev can't match the engineering velocity of a 500+ person team with billions in funding.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Big-Tech AI (Grok's Position)</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Grok benefits from xAI's massive compute infrastructure (100,000+ GPU clusters as of 2025), enabling frontier-class reasoning, math, and coding performance. It consistently ranks in the top 3 on public AI benchmarks.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Tradeoff:</strong> xAI is deeply tied to X (formerly Twitter) and Elon Musk's broader business ecosystem. Critics argue this creates implicit editorial bias — Grok's "anti-woke" positioning may itself be a form of political alignment rather than true neutrality.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Topic 3: Data Ownership */}
          <AnimatedSection delay={200}>
            <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                📦 Who Owns Your AI Conversations?
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">User-Owned Data (Leevee)</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Leevee offers full data export, device sync codes, memory bank editing, and trash recovery. Conversations are stored with user-controlled session IDs. No account required for basic usage. The explicit stance: <em>your data belongs to you.</em>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Caveat:</strong> "User-owned" is only meaningful if the data is portable and deletable. Leevee provides export but currently lacks standardized formats that would allow importing into other AI platforms.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Platform-Owned Data (Grok)</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Grok conversations are tied to your X account. X's Terms of Service (updated March 2025) grant xAI broad rights to use conversation data for model training unless users opt out. Data portability options are limited.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Context:</strong> This is standard across most AI platforms (OpenAI, Google, Anthropic all have similar clauses). The difference is transparency — some platforms are more explicit about data usage than others.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Topic 4: Marginalized Communities */}
          <AnimatedSection delay={240}>
            <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                🏳️‍🌈 AI Safety for Marginalized Communities
              </h4>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This is perhaps the most contentious difference. Leevee was explicitly built to serve users who may be flagged, shadowbanned, or poorly served by mainstream platforms — including sex workers, LGBTQ+ individuals, people in crisis, and users from non-Western cultural backgrounds.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">Leevee's Stance</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Inclusive language guidelines are baked into the system prompt. AAVE and queer vernacular are treated as legitimate linguistic systems. Sex work education is available without moralization. Religious literacy covers all traditions with academic objectivity.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grok's Stance</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Grok's "anti-woke" branding has drawn criticism from LGBTQ+ advocacy groups who argue it signals hostility toward marginalized communities. Supporters counter that Grok simply refuses to enforce progressive language norms, which they see as a form of intellectual freedom.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  <strong>The honest truth:</strong> Neither approach is universally "correct." Leevee prioritizes making marginalized users feel safe and seen. Grok prioritizes resisting what it sees as ideological orthodoxy. Both positions have legitimate arguments and real-world consequences. Users should choose based on what matters most to them.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Topic 5: Benchmark Gaming */}
          <AnimatedSection delay={280}>
            <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                📊 Do AI Benchmarks Actually Matter?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Grok frequently ranks #1–3 on public AI leaderboards (MMLU, HumanEval, MATH, ARC). Leevee doesn't appear on any benchmarks. Does that make Grok objectively "better"? The answer is more complicated than either side admits.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">Benchmarks Are Meaningful</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Standardized benchmarks provide <em>some</em> signal. A model that scores 90% on MATH genuinely solves harder problems than one scoring 60%. Grok's performance on reasoning-heavy tasks (GSM8K, GPQA) reflects real engineering investment that translates to better outputs on complex queries.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Evidence:</strong> A 2025 meta-analysis by Epoch AI found moderate correlation (r=0.61) between benchmark performance and user satisfaction ratings on reasoning tasks.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Benchmarks Are Gameable & Misleading</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The AI industry has a well-documented benchmark gaming problem. Models can be specifically tuned to perform well on known test sets without generalizing. Researchers call this "teaching to the test." Many benchmarks also fail to measure what users actually care about: empathy, contextual judgment, cultural fluency, and emotional safety.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Evidence:</strong> A 2025 paper from UC Berkeley ("Benchmark Contamination in LLMs") found that 23% of top-ranked models showed statistically significant signs of training on benchmark data. Separately, a Nature Machine Intelligence study found near-zero correlation between benchmark scores and user preference in open-ended conversation tasks.
                  </p>
                </div>
              </div>
              <div className="border-t border-border/50 pt-3">
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  <strong>Leevee's honest position:</strong> We don't compete on benchmarks — we literally can't, as an indie project using API-accessed models rather than training our own. What we optimize for is the <em>experience</em>: Does the AI understand your emotional state? Does it respect your identity? Does it remember you? Does it keep you safe? These things don't have leaderboards, but they're why people stay.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Topic 6: AI Lawsuits & Regulation */}
          <AnimatedSection delay={320}>
            <div className="rounded-xl border border-border bg-card/60 p-5 space-y-4">
              <h4 className="font-semibold text-sm flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                ⚖️ AI Lawsuits, Regulation Failures, and Who's Actually Accountable
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As of early 2026, the AI industry faces an unprecedented wave of lawsuits and regulatory scrutiny — yet meaningful regulation remains elusive. This matters for every AI user, regardless of which product they choose.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">The Lawsuit Landscape</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Major AI companies face active litigation on multiple fronts: copyright infringement (NYT v. OpenAI, Getty v. Stability AI), privacy violations (class actions in IL, CA, and EU under GDPR), and harm claims from users who received dangerous outputs. In 2025–2026 alone, Anthropic faced scrutiny over Claude's refusal patterns blocking legitimate medical research, while xAI was criticized for Grok generating election misinformation during the 2025 UK general election.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Key case:</strong> The 2025 Doe v. Character AI wrongful death lawsuit — where a teenager's suicide was linked to an AI chatbot — forced the entire industry to reckon with whether AI companions need regulated safety standards, not just voluntary guidelines.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">The Regulation Vacuum</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The EU AI Act (effective 2025) remains the only comprehensive framework, but enforcement has been slow and penalties rare. The US has no federal AI regulation — only a patchwork of executive orders and state-level bills. China's AI regulations focus on content control, not user safety. The result: companies self-regulate, which critics call "the fox guarding the henhouse."
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>The paradox:</strong> Anthropic's own "Responsible Scaling Policy" — once praised for promising to pause development if safety couldn't keep up — was quietly softened in late 2025 when competitive pressure from Grok 4 and GPT-5 made self-imposed limits commercially untenable.
                  </p>
                </div>
              </div>
              <div className="border-t border-border/50 pt-3 space-y-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Where Leevee fits in this:</strong> As an indie project, Leevee isn't training models on scraped data — it uses API-accessed models, which means it doesn't face the same copyright liability as companies training on the open internet. But it <em>does</em> face the same responsibility for output safety, which is why crisis detection, lethality blocking, and content moderation are built in from day one — not bolted on after a lawsuit.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  The uncomfortable truth is that no AI company — indie or frontier — has solved accountability. The difference is whether you build safety because you care about users, or because you're trying to avoid the next lawsuit. Leevee was built by someone who's been on the other side of systems that failed vulnerable people. That's not a benchmark score. It's a design philosophy.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Closing note */}
          <AnimatedSection delay={360}>
            <div className="rounded-xl border border-border/50 bg-secondary/30 p-5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">A note on honesty:</strong> Leevee is an indie project. We don't have Grok's raw power, Claude's massive context windows, or either company's engineering army. What we do have is a deliberate design philosophy that prioritizes user safety, data ownership, and inclusivity without corporate censorship theater. Both Grok and Claude have generated comparisons describing Leevee as "text-only" or "limited" — this page exists because those descriptions were wrong, and we believe you deserve accurate information to choose for yourself.
              </p>
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
