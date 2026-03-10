import AnimatedSection from "@/components/AnimatedSection";
import { Heart, Users, Lightbulb, Globe } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

const AboutSection = () => {
  const { t } = useI18n();

  const features = [
    { icon: <Heart className="w-5 h-5" />, title: t.about.curatedTitle, description: t.about.curatedDesc },
    { icon: <Users className="w-5 h-5" />, title: t.about.communityTitle, description: t.about.communityDesc },
    { icon: <Lightbulb className="w-5 h-5" />, title: t.about.freeTitle, description: t.about.freeDesc },
    { icon: <Globe className="w-5 h-5" />, title: t.about.accessibleTitle, description: t.about.accessibleDesc },
  ];

  return (
    <section id="about" className="py-28 px-4 relative">
      <div className="absolute top-0 left-0 right-0 h-px opacity-10" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gradient-start)), hsl(var(--gradient-end)), transparent)" }} />
      <div className="max-w-5xl mx-auto">
        <AnimatedSection>
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4 font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.about.label}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.about.title}</h2>
            <div className="w-12 h-[2px] mx-auto mt-5 rounded-full" style={{ background: "linear-gradient(90deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }} />
            <p className="text-muted-foreground text-sm md:text-base mt-5 max-w-lg mx-auto leading-[1.8]">{t.about.description}</p>
          </div>
        </AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <AnimatedSection key={index} delay={index * 100}>
              <div className="group bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden h-full">
                <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" style={{ background: "linear-gradient(90deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }} />
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-6 text-primary-foreground shadow-md" style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-3 tracking-wide uppercase text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-[1.7]">{feature.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
