import AnimatedSection from "@/components/AnimatedSection";
import { ArrowRight, Mail } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

const CTASection = () => {
  const { t } = useI18n();

  return (
    <section className="py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <AnimatedSection>
          <div
            className="relative rounded-3xl p-12 md:p-16 text-center overflow-hidden shadow-2xl shadow-black/20"
            style={{ background: "linear-gradient(160deg, hsl(225 24% 14%), hsl(225 24% 8%))" }}
          >
            {/* Border glow */}
            <div
              className="absolute inset-0 rounded-3xl p-[1px]"
              style={{
                background: "linear-gradient(135deg, hsl(var(--gradient-start) / 0.25), hsl(var(--gradient-end) / 0.25))",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />

            {/* Glow blobs */}
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.08] blur-[120px] pointer-events-none" style={{ background: "hsl(var(--primary))" }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-[0.05] blur-[100px] pointer-events-none" style={{ background: "hsl(var(--accent))" }} />

            <h2
              className="text-2xl md:text-4xl font-bold mb-5 tracking-tight relative z-10"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(210 20% 94%)" }}
            >
              {t.cta.title}
            </h2>
            <p className="text-sm md:text-base leading-[1.8] mb-10 max-w-lg mx-auto relative z-10" style={{ color: "hsl(215 12% 60%)" }}>
              {t.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <a
                href="mailto:safehubhelp@zohomail.com"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-primary-foreground text-sm font-semibold tracking-wide uppercase transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <Mail className="w-4 h-4" />
                {t.cta.contactUs}
              </a>
              <a
                href="#resources"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl border border-white/10 text-sm font-semibold tracking-wide uppercase transition-all hover:border-primary/40 hover:text-primary"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "hsl(210 15% 85%)" }}
              >
                {t.cta.browseResources}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default CTASection;
