import logo from "@/assets/safehelphublogo.jpg";
import AnimatedSection from "@/components/AnimatedSection";
import { ArrowDown, Shield, Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-[108px] sm:pt-[104px]">
      {/* Refined background glows */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.06] blur-[200px] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.03] blur-[150px] pointer-events-none"
        style={{ background: "hsl(var(--accent))" }}
      />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 0.5px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <AnimatedSection>
        <div className="relative z-10 flex flex-col items-center gap-10 text-center px-4 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-border/60 bg-card/40 backdrop-blur-md shadow-sm">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {t.hero.badge}
            </span>
          </div>

          {/* Logo with refined glow */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl blur-2xl opacity-20" style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }} />
            <div className="relative p-[2px] rounded-2xl" style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}>
              <img src={logo} alt="Polly AI logo" className="w-20 h-20 md:w-24 md:h-24 rounded-[14px] object-cover" />
            </div>
          </div>

          <div className="space-y-5">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--warm-glow)), hsl(var(--gradient-end)))" }}>
                {t.hero.title}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base tracking-[0.25em] uppercase font-medium">
              {t.hero.subtitle}
            </p>
          </div>

          <p className="max-w-lg text-muted-foreground text-sm md:text-base leading-[1.8]">
            {t.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <a
              href="#resources"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-primary-foreground text-sm font-semibold tracking-wide uppercase transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Sparkles className="w-4 h-4" />
              {t.hero.explore}
              <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border/60 text-foreground text-sm font-semibold tracking-wide uppercase transition-all hover:border-primary/40 hover:text-primary hover:bg-primary/5"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t.hero.learnMore}
            </a>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
};

export default HeroSection;
