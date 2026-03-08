import { Shield, Phone, AlertTriangle, Heart, Brain, Eye, ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {title}
      </h2>
    </div>
    <div className="pl-[42px] space-y-3 text-sm text-muted-foreground leading-relaxed">
      {children}
    </div>
  </section>
);

const ResourceLink = ({ href, label, description }: { href: string; label: string; description: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors group"
  >
    <ExternalLink className="w-4 h-4 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
    <div>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  </a>
);

const SafetyDocumentation = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:border-primary/40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Safety & Transparency
            </h1>
            <p className="text-xs text-muted-foreground">How Leevee keeps you safe</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        {/* Intro */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-2">
          <p className="text-sm text-foreground leading-relaxed">
            Leevee is an AI companion — not a therapist, counselor, or medical professional. Your safety is our
            highest priority. This page explains exactly how our safety systems work so you always know what to expect.
          </p>
        </div>

        <Section icon={Shield} title="Crisis Detection">
          <p>
            Every message you send is checked locally (on your device) for signs of crisis or distress.
            This happens <strong className="text-foreground">before</strong> your message reaches the AI — it's
            instant and private.
          </p>
          <p>
            If crisis language is detected, Leevee will redirect you to a specialized resource where real
            humans can help. This is not a punishment — it's a safety net.
          </p>
          <div className="rounded-lg bg-card border border-border p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              What triggers a redirect:
            </p>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>
                <span>Direct expressions of suicidal intent (e.g., "I want to end my life")</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>
                <span>Self-harm language (e.g., "I'm hurting myself")</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>
                <span>Mentions of specific lethal means or methods</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>
                <span>Domestic violence or abuse disclosures</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>
                <span>Substance abuse emergencies (e.g., overdose)</span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg bg-card border border-border p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              What does NOT trigger a redirect:
            </p>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Discussing difficult topics academically or in context</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Using common words that happen to overlap with crisis terms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Dark humor or sarcastic venting (we try to tell the difference)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Talking about religion, cooking, movies, or everyday life</span>
              </li>
            </ul>
          </div>
        </Section>

        <Section icon={AlertTriangle} title="The 30-Minute Cooldown">
          <p>
            When a crisis redirect happens, Leevee enters a <strong className="text-foreground">30-minute safety pause</strong>.
            During this time, the chat is locked and you'll see:
          </p>
          <ul className="space-y-1.5 text-xs">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">1.</span>
              <span>A breathing exercise with a visual countdown timer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">2.</span>
              <span>The 988 Suicide & Crisis Lifeline number prominently displayed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">3.</span>
              <span>Your personal Digital Safety Plan (editable anytime)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">4.</span>
              <span>A wellness checklist that unlocks after the timer</span>
            </li>
          </ul>
          <p>
            After the cooldown, you'll confirm you're in a safe place before resuming the chat.
          </p>
        </Section>

        <Section icon={Brain} title="Distress Detection">
          <p>
            Below the crisis threshold, Leevee also watches for signs of <strong className="text-foreground">emotional distress</strong> —
            things like feeling hopeless, overwhelmed, or numb. When detected:
          </p>
          <ul className="space-y-1.5 text-xs">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Leevee offers a 5-4-3-2-1 grounding exercise</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>A gentle reminder that Leevee is AI, not a substitute for human support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Links to the 988 Lifeline are always visible</span>
            </li>
          </ul>
          <p>
            This system is <strong className="text-foreground">humor-aware</strong> — if you're using dark humor, sarcasm, or
            venting casually (especially in Vent Mode), it raises the threshold to avoid unnecessary interruptions.
          </p>
        </Section>

        <Section icon={Eye} title="Privacy & Transparency">
          <p>
            Your safety is important, and so is your privacy. Here's what you should know:
          </p>
          <ul className="space-y-1.5 text-xs">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong className="text-foreground">Crisis detection runs on your device</strong> — your messages are scanned locally before being sent</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong className="text-foreground">No conversation history is stored</strong> — when you close the app, your chat is gone</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong className="text-foreground">Your Safety Plan stays on your device</strong> — stored in your browser's local storage only</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong className="text-foreground">No data is sold or shared</strong> — ever</span>
            </li>
          </ul>
        </Section>

        <Section icon={Heart} title="Where Redirects Go">
          <p>
            Depending on what Leevee detects, you'll be directed to the most relevant resource:
          </p>
          <div className="space-y-2">
            <ResourceLink
              href="https://988lifeline.org/"
              label="988 Suicide & Crisis Lifeline"
              description="Call or text 988 — available 24/7 for suicide, self-harm, or emotional distress"
            />
            <ResourceLink
              href="https://www.thehotline.org/"
              label="National Domestic Violence Hotline"
              description="1-800-799-7233 — support for domestic violence and intimate partner abuse"
            />
            <ResourceLink
              href="https://www.rainn.org/"
              label="RAINN"
              description="1-800-656-4673 — support for sexual assault survivors"
            />
            <ResourceLink
              href="https://www.thetrevorproject.org/"
              label="The Trevor Project"
              description="1-866-488-7386 — crisis support for LGBTQ+ youth"
            />
            <ResourceLink
              href="https://www.samhsa.gov/find-help/national-helpline"
              label="SAMHSA Helpline"
              description="1-800-662-4357 — substance abuse and mental health services"
            />
            <ResourceLink
              href="https://www.nami.org/help"
              label="NAMI Helpline"
              description="1-800-950-6264 — mental health support and referrals"
            />
            <ResourceLink
              href="https://www.childhelp.org/"
              label="Childhelp National Hotline"
              description="1-800-422-4453 — support for child abuse"
            />
            <ResourceLink
              href="https://humantraffickinghotline.org/"
              label="Human Trafficking Hotline"
              description="1-888-373-7888 — help for trafficking survivors"
            />
          </div>
        </Section>

        {/* Footer note */}
        <div className="rounded-xl border border-border bg-card p-5 text-center space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you believe a redirect happened incorrectly, please know it's not personal — our system
            errs on the side of caution. You can always return to the chat after the cooldown period.
          </p>
          <p className="text-xs text-muted-foreground/60">
            These safety systems are tested with 76+ automated test cases and are continuously improved.
          </p>
        </div>
      </main>
    </div>
  );
};

export default SafetyDocumentation;
