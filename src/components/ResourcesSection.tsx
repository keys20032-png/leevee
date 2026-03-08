import { useState } from "react";
import { Search, BookOpen, Brain, Shield, DollarSign, ExternalLink, ChevronDown, ChevronUp, Bookmark, BookmarkCheck } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useI18n } from "@/i18n/I18nContext";

interface Resource {
  title: string;
  description: string;
  category: string;
  url: string;
}

interface Section {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  resources: Resource[];
}

const ResourcesSection = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const { t } = useI18n();

  const sections: Section[] = [
    {
      title: t.resources.learningTitle,
      subtitle: t.resources.learningSub,
      icon: <BookOpen className="w-5 h-5" />,
      resources: [
        { title: "My Plan", description: "Personal planning and goal-setting tool", category: t.resources.learningTitle, url: "https://blend-tofu-18399917.figma.site/" },
        { title: "Lifeline Connect", description: "Crisis support connection platform", category: t.resources.learningTitle, url: "https://your-lifeline-connect.lovable.app" },
        { title: "Accomplish", description: "Task and goal tracker to stay organized and achieve more", category: t.resources.learningTitle, url: "https://sn2nzkyyc6tas.ok.kimi.link/" },
      ],
    },
    {
      title: t.resources.mentalTitle,
      subtitle: t.resources.mentalSub,
      icon: <Brain className="w-5 h-5" />,
      resources: [
        { title: "Mind Support", description: "Mental health support and coping strategies", category: t.resources.mentalTitle, url: "https://lair-shell-74747420.figma.site/" },
        { title: "Wellness Wins", description: "Daily wellness tracking and motivation", category: t.resources.mentalTitle, url: "https://wellness-wins-site.lovable.app/" },
        { title: "FocusFlow", description: "Productivity and focus tools to help you stay on track", category: t.resources.mentalTitle, url: "https://iyjgjttc35uwe.ok.kimi.link" },
      ],
    },
    {
      title: t.resources.supportTitle,
      subtitle: t.resources.supportSub,
      icon: <Shield className="w-5 h-5" />,
      resources: [
        { title: "The Support HUB", description: "Centralized support resource directory", category: t.resources.supportTitle, url: "https://cure-cure-64594088.figma.site/" },
        { title: "Insight Shield", description: "Online safety and digital protection", category: t.resources.supportTitle, url: "https://insight-shield-web.lovable.app/" },
        { title: "Safer Choices", description: "Making informed safety decisions", category: t.resources.supportTitle, url: "https://dodge-oven-26086229.figma.site/" },
        { title: "HopeRising", description: "Hope and recovery support platform", category: t.resources.supportTitle, url: "https://light-of-hope-project.lovable.app/" },
        { title: "Tasty Start", description: "Food security and nutrition resources", category: t.resources.supportTitle, url: "https://tasty-start.lovable.app/" },
      ],
    },
    {
      title: t.resources.financialTitle,
      subtitle: t.resources.financialSub,
      icon: <DollarSign className="w-5 h-5" />,
      resources: [
        { title: "Bloom - Basic Finance Help", description: "Beginner-friendly financial literacy", category: t.resources.financialTitle, url: "https://happy-money-start.lovable.app/" },
        { title: "BLOOM Center Hub", description: "Comprehensive financial wellness center", category: t.resources.financialTitle, url: "https://bloom-cents-simple.lovable.app/" },
      ],
    },
  ];

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredSections = sections
    .map((section) => ({
      ...section,
      resources: section.resources.filter(
        (r) =>
          (r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.description.toLowerCase().includes(search.toLowerCase()) ||
            r.category.toLowerCase().includes(search.toLowerCase())) &&
          (!activeCategory || r.category === activeCategory)
      ),
    }))
    .filter((section) => section.resources.length > 0);

  const categories = sections.map((s) => s.title);

  return (
    <section id="resources" className="pt-44 pb-24 px-4 relative mt-20">
      <div className="absolute top-0 left-0 right-0 h-[1px] opacity-20" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gradient-start)), hsl(var(--gradient-end)), transparent)" }} />
      <div className="max-w-5xl mx-auto">
        <AnimatedSection>
          <div className="text-center mb-6">
            <p className="text-xs tracking-[0.3em] uppercase text-primary mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.resources.browse}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.resources.title}</h2>
            <div className="w-16 h-[2px] mx-auto mt-4" style={{ background: "linear-gradient(90deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }} />
            <p className="text-muted-foreground text-sm md:text-base mt-4 max-w-xl mx-auto leading-relaxed">{t.resources.description}</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="resource-search" className="sr-only">{t.resources.searchPlaceholder}</label>
              <input
                id="resource-search"
                type="text"
                placeholder={t.resources.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              />
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={150}>
          <div className="flex flex-wrap justify-center gap-2 mb-14">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-xs tracking-[0.1em] uppercase border transition-all ${!activeCategory ? "border-primary/60 text-primary bg-primary/10" : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t.resources.all}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-4 py-1.5 rounded-full text-xs tracking-[0.1em] uppercase border transition-all ${activeCategory === cat ? "border-primary/60 text-primary bg-primary/10" : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {cat}
              </button>
            ))}
          </div>
        </AnimatedSection>

        <div className="space-y-10">
          {filteredSections.map((section, index) => {
            const isExpanded = expandedSections[section.title] !== false;
            const visibleResources = isExpanded ? section.resources : section.resources.slice(0, 3);
            const hasMore = section.resources.length > 3;

            return (
              <AnimatedSection key={section.title} delay={index * 100}>
                <div className="bg-card/30 border border-border rounded-xl p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-primary-foreground flex-shrink-0" style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}>
                      {section.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground tracking-wide uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{section.title}</h3>
                      <p className="text-muted-foreground text-xs mt-1">{section.subtitle}</p>
                    </div>
                  </div>

                  <div className="h-[1px] opacity-20 my-5" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gradient-start) / 0.5), transparent)" }} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleResources.map((resource) => (
                      <a
                        key={resource.title}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative bg-background/50 border border-border rounded-lg p-5 flex flex-col hover:border-primary/40 transition-all duration-300 overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }} />
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">{resource.title}</h4>
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(resource.title); }}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              aria-label={isBookmarked(resource.title) ? t.resources.bookmarkRemove : t.resources.bookmarkAdd}
                            >
                              {isBookmarked(resource.title) ? <BookmarkCheck className="w-3.5 h-3.5 text-primary" /> : <Bookmark className="w-3.5 h-3.5" />}
                            </button>
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary mt-0.5 transition-colors" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{resource.description}</p>
                      </a>
                    ))}
                  </div>

                  {hasMore && (
                    <button
                      onClick={() => toggleSection(section.title)}
                      className="mt-4 mx-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors tracking-[0.1em] uppercase"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {isExpanded ? (
                        <>{t.resources.showLess} <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>{t.resources.showAll} ({section.resources.length}) <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  )}
                </div>
              </AnimatedSection>
            );
          })}

          {filteredSections.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t.resources.noResults} "<span className="text-foreground">{search}</span>"
              </p>
              <button onClick={() => { setSearch(""); setActiveCategory(null); }} className="mt-3 text-primary text-sm hover:underline">
                {t.resources.clearFilters}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
