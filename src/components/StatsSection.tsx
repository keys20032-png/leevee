import AnimatedSection from "@/components/AnimatedSection";
import { useI18n } from "@/i18n/I18nContext";

const StatsSection = () => {
  const { t } = useI18n();

  const stats = [
    { value: "7", label: t.stats.resources },
    { value: "10+", label: t.stats.categories },
    { value: "99.9%", label: t.stats.free },
    { value: "24/7", label: t.stats.available },
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }} />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 80}>
              <div className="text-center group">
                <p
                  className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent mb-3 transition-transform group-hover:scale-105"
                  style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--warm-glow)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {stat.label}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
