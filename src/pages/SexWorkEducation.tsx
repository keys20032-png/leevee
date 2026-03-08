import { ArrowLeft, AlertTriangle, Phone, Scale, ShieldCheck, HeartCrack, DollarSign, Brain, Eye, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";

const PROS = [
  { icon: DollarSign, text: "Financial independence and flexible scheduling in regulated, legal settings." },
  { icon: ShieldCheck, text: "Legal protections in licensed environments — health screenings, workplace safety, labor rights." },
  { icon: Scale, text: "Autonomy and bodily agency — the right to make informed choices about one's own labor." },
  { icon: DollarSign, text: "Can fund education, career transitions, or other life goals in the short term." },
];

const CONS = [
  { icon: HeartCrack, text: "Stigma and social isolation — impacts relationships, future employment, housing, and custody." },
  { icon: Brain, text: "Mental health toll — emotional labor, boundary violations, burnout, PTSD, depression, and anxiety are common." },
  { icon: AlertTriangle, text: "Physical health risks — STIs, physical injury, and substance use as a coping mechanism." },
  { icon: DollarSign, text: "Financial instability — income is inconsistent, no employer benefits, no retirement plan in most cases." },
  { icon: Eye, text: "Digital permanence — content can be screenshotted, leaked, shared without consent, or used for coercion." },
  { icon: AlertTriangle, text: "Exploitation risk — even in 'legal' settings, coercion, manipulation, and trafficking exist." },
  { icon: HeartCrack, text: "Age discrimination — earning potential often decreases, creating pressure to start younger." },
  { icon: Scale, text: "Legal gray areas — laws vary wildly; what's legal in one state or country may be a felony elsewhere." },
  { icon: DollarSign, text: "Tax and banking complications — many financial institutions discriminate against sex workers." },
  { icon: AlertTriangle, text: "Exit barriers — difficulty transitioning to other careers due to résumé gaps, stigma, or lack of references." },
];

const RESOURCES = [
  { name: "SWOP (Sex Workers Outreach Project)", description: "Advocacy, support, and community for current and former sex workers.", url: "https://swopusa.org" },
  { name: "St. James Infirmary", description: "Free health and social services by and for sex workers.", url: "https://stjamesinfirmary.org" },
  { name: "National Human Trafficking Hotline", description: "24/7 confidential support — call 1-888-373-7888 or text 233733.", url: "https://humantraffickinghotline.org" },
  { name: "RAINN", description: "Support for survivors of sexual violence — call 1-800-656-4673.", url: "https://rainn.org" },
];

const SexWorkEducation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            to="/#resources"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </Link>

          {/* Header */}
          <AnimatedSection>
            <div className="text-center mb-12 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs tracking-widest uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <Scale className="w-3.5 h-3.5" />
                Objective Education
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                The Truth About Sex Work
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Not a promotion. Not a condemnation. Just the facts — so anyone considering this path can make a truly informed decision.
              </p>
            </div>
          </AnimatedSection>

          {/* Disclaimer */}
          <AnimatedSection delay={100}>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 mb-10 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Important Notice</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This page provides objective, educational information about <strong>legal</strong> forms of sex work. It does not encourage or condone illegal activity. Laws vary by location — always research your local laws. If you are being forced, coerced, or trafficked, call the <strong>National Human Trafficking Hotline at 1-888-373-7888</strong> immediately.
              </p>
            </div>
          </AnimatedSection>

          {/* What counts as legal */}
          <AnimatedSection delay={150}>
            <div className="rounded-xl border border-border bg-card p-6 mb-8 space-y-3">
              <h2 className="text-lg font-semibold text-foreground tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                What Is "Legal" Sex Work?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Legal sex work varies by jurisdiction but can include: licensed work in regulated establishments (e.g., parts of Nevada), adult content creation (OnlyFans, cam work), exotic dancing/stripping, legal pornography production, and phone/text-based services. What's legal in one place may be criminal in another — <strong>always verify local laws before making any decisions</strong>.
              </p>
            </div>
          </AnimatedSection>

          {/* Pros */}
          <AnimatedSection delay={200}>
            <div className="rounded-xl border border-border bg-card p-6 mb-8 space-y-4">
              <h2 className="text-lg font-semibold text-foreground tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Potential Pros
              </h2>
              <p className="text-xs text-muted-foreground mb-2">In legal, regulated environments, some people report:</p>
              <ul className="space-y-3">
                {PROS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10">
                      <item.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          {/* Cons */}
          <AnimatedSection delay={250}>
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 mb-8 space-y-4">
              <h2 className="text-lg font-semibold text-foreground tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Realities & Risks — What Many Don't Hear
              </h2>
              <p className="text-xs text-muted-foreground mb-2">These are documented outcomes that people often aren't told before entering:</p>
              <ul className="space-y-3">
                {CONS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-destructive/10">
                      <item.icon className="w-3.5 h-3.5 text-destructive" />
                    </div>
                    <span className="text-sm text-muted-foreground leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          {/* Before you decide */}
          <AnimatedSection delay={300}>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-8 space-y-3">
              <h2 className="text-lg font-semibold text-foreground tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Before You Decide — A Safety Checklist
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">1.</span>
                  <span><strong>Research your local laws.</strong> Know exactly what is and isn't legal where you live.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">2.</span>
                  <span><strong>Talk to people who've done it.</strong> Connect with sex worker-led organizations (not recruiters or third parties).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">3.</span>
                  <span><strong>Make a safety plan.</strong> Trusted contacts, boundaries, screening methods, and an exit strategy.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">4.</span>
                  <span><strong>Understand the financial reality.</strong> Income is inconsistent. Plan for taxes, savings, and future career transitions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">5.</span>
                  <span><strong>Protect your mental health.</strong> Have a therapist or support system in place before you start.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">6.</span>
                  <span><strong>Know the digital risks.</strong> Anything shared online can be permanent. Use separate identities and devices.</span>
                </li>
              </ul>
            </div>
          </AnimatedSection>

          {/* Crisis / trafficking banner */}
          <AnimatedSection delay={350}>
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 mb-8 text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-5 h-5 text-destructive" />
                <span className="text-sm font-semibold text-destructive" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Being Forced or Coerced? Help Is Available 24/7
                </span>
              </div>
              <p className="text-sm text-destructive/90">
                National Human Trafficking Hotline: <a href="tel:18883737888" className="font-bold underline">1-888-373-7888</a>
              </p>
              <p className="text-xs text-destructive/70">
                Text <span className="font-semibold">233733</span> or chat at <a href="https://humantraffickinghotline.org" target="_blank" rel="noopener noreferrer" className="underline">humantraffickinghotline.org</a>
              </p>
            </div>
          </AnimatedSection>

          {/* Resources */}
          <AnimatedSection delay={400}>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Harm Reduction & Support Resources
              </h2>
              <div className="grid gap-3">
                {RESOURCES.map((r) => (
                  <a
                    key={r.name}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 p-4 rounded-lg border border-border bg-background/50 hover:border-primary/40 transition-all"
                  >
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary mt-0.5 flex-shrink-0 transition-colors" />
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{r.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SexWorkEducation;
