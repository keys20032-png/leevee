import { Phone, ExternalLink, ArrowLeft, Heart, Shield, Baby, Users, Scale, Utensils, Pill, UserCheck, Smartphone, Medal, CloudLightning, HelpCircle, Home, Headphones, Gamepad2, Accessibility, HandHeart, GraduationCap, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CrisisResourceCard from "@/components/CrisisResourceCard";
import SafetyCheckScreen from "@/components/SafetyCheckScreen";
import { useI18n } from "@/i18n/I18nContext";

export interface CrisisResource {
  name: string;
  description: string;
  phone: string | null;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  category: string;
}

const categoryKeys = [
  "catAll",
  "catMentalHealth",
  "catYouthChildren",
  "catLGBTQ",
  "catViolenceAbuse",
  "catSubstanceUse",
  "catDisability",
  "catFamilyParenting",
  "catDisasterEmergency",
] as const;

// Internal category IDs (not displayed, used for filtering)
const categoryIds = [
  "All",
  "Mental Health",
  "Youth & Children",
  "LGBTQ+",
  "Violence & Abuse",
  "Substance Use",
  "Disability & Neurodiversity",
  "Family & Parenting",
  "Disaster & Emergency",
] as const;

export const resources: CrisisResource[] = [
  {
    name: "988 Suicide & Crisis Lifeline",
    description: "Free, confidential 24/7 support for people in suicidal crisis or emotional distress. Call or text 988.",
    phone: "988",
    url: "https://988lifeline.org/",
    icon: Heart,
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    category: "Mental Health",
  },
  {
    name: "Childhelp National Child Abuse Hotline",
    description: "Crisis intervention, information, and referrals for child abuse situations. Available 24/7 in over 170 languages.",
    phone: "1-800-422-4453",
    url: "https://www.childhelp.org/",
    icon: Shield,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    category: "Youth & Children",
  },
  {
    name: "The Trevor Project",
    description: "Crisis intervention and suicide prevention for LGBTQ+ young people. Call, text, or chat 24/7.",
    phone: "1-866-488-7386",
    url: "https://www.thetrevorproject.org/",
    icon: Users,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    category: "LGBTQ+",
  },
  {
    name: "National Domestic Violence Hotline",
    description: "Confidential support, resources, and safety planning for anyone affected by domestic violence. Available 24/7.",
    phone: "1-800-799-7233",
    url: "https://www.thehotline.org/",
    icon: Shield,
    color: "from-teal-500 to-cyan-600",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20",
    category: "Violence & Abuse",
  },
  {
    name: "RAINN (Sexual Assault Hotline)",
    description: "The nation's largest anti-sexual violence organization. Free, confidential 24/7 support.",
    phone: "1-800-656-4673",
    url: "https://www.rainn.org/",
    icon: Scale,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    category: "Violence & Abuse",
  },
  {
    name: "National Human Trafficking Hotline",
    description: "24/7 confidential hotline for victims and survivors of human trafficking. Multilingual support available.",
    phone: "1-888-373-7888",
    url: "https://humantraffickinghotline.org/",
    icon: HelpCircle,
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
    category: "Violence & Abuse",
  },
  {
    name: "National Eating Disorders Association",
    description: "Support, resources, and treatment options for those struggling with eating disorders. Call, text, or chat.",
    phone: "1-800-931-2237",
    url: "https://www.nationaleatingdisorders.org/",
    icon: Utensils,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    category: "Mental Health",
  },
  {
    name: "SAMHSA National Helpline",
    description: "Free, confidential 24/7 treatment referral and information service for substance use disorders. Available in English and Spanish.",
    phone: "1-800-662-4357",
    url: "https://www.samhsa.gov/find-help/national-helpline",
    icon: Pill,
    color: "from-sky-500 to-blue-600",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/20",
    category: "Substance Use",
  },
  {
    name: "National Center on Elder Abuse",
    description: "Resources and information for preventing elder abuse, neglect, and exploitation.",
    phone: "1-855-500-3537",
    url: "https://ncea.acl.gov/",
    icon: UserCheck,
    color: "from-yellow-500 to-amber-600",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    category: "Violence & Abuse",
  },
  {
    name: "Postpartum Support International",
    description: "Support for perinatal mental health including postpartum depression, anxiety, and psychosis. Call or text.",
    phone: "1-800-944-4773",
    url: "https://www.postpartum.net/",
    icon: Baby,
    color: "from-pink-500 to-fuchsia-600",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    category: "Family & Parenting",
  },
  {
    name: "StopBullying.gov",
    description: "Federal government resources for preventing and responding to bullying and cyberbullying.",
    phone: null,
    url: "https://www.stopbullying.gov/",
    icon: Smartphone,
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    category: "Youth & Children",
  },
  {
    name: "Veterans Crisis Line",
    description: "Free, confidential 24/7 support for Veterans and their loved ones. Call, text 838255, or chat online.",
    phone: "988 (press 1)",
    url: "https://www.veteranscrisisline.net/",
    icon: Medal,
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    category: "Mental Health",
  },
  {
    name: "American Red Cross",
    description: "Disaster relief, emergency assistance, and preparedness resources for individuals and communities.",
    phone: "1-800-733-2767",
    url: "https://www.redcross.org/",
    icon: CloudLightning,
    color: "from-red-600 to-rose-700",
    bgColor: "bg-red-600/10",
    borderColor: "border-red-600/20",
    category: "Disaster & Emergency",
  },
  {
    name: "Crisis Text Line",
    description: "Free 24/7 crisis support via text. Text HOME to 741741 to connect with a trained crisis counselor.",
    phone: "Text HOME to 741741",
    url: "https://www.crisistextline.org/",
    icon: Smartphone,
    color: "from-indigo-500 to-purple-600",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    category: "Mental Health",
  },
  {
    name: "NAMI Helpline",
    description: "National Alliance on Mental Illness provides free support, education, and resources for individuals and families affected by mental illness.",
    phone: "1-800-950-6264",
    url: "https://www.nami.org/help",
    icon: Headphones,
    color: "from-cyan-500 to-teal-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    category: "Mental Health",
  },
  {
    name: "National Runaway Safeline",
    description: "24/7 crisis intervention for runaway, homeless, and at-risk youth. Call, text, or chat for support and safety planning.",
    phone: "1-800-786-2929",
    url: "https://www.1800runaway.org/",
    icon: Home,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    category: "Youth & Children",
  },
  {
    name: "Trans Lifeline",
    description: "Peer support hotline run by and for trans people. No non-consensual active rescue. Available 24/7.",
    phone: "1-877-565-8860",
    url: "https://translifeline.org/",
    icon: HandHeart,
    color: "from-sky-400 to-pink-500",
    bgColor: "bg-sky-400/10",
    borderColor: "border-sky-400/20",
    category: "LGBTQ+",
  },
  {
    name: "National Problem Gambling Helpline",
    description: "Confidential 24/7 helpline for anyone affected by problem gambling. Call, text, or chat.",
    phone: "1-800-522-4700",
    url: "https://www.ncpgambling.org/",
    icon: Gamepad2,
    color: "from-lime-500 to-green-600",
    bgColor: "bg-lime-500/10",
    borderColor: "border-lime-500/20",
    category: "Substance Use",
  },
  {
    name: "Disaster Distress Helpline",
    description: "24/7 crisis counseling for people experiencing emotional distress related to natural or human-caused disasters.",
    phone: "1-800-985-5990",
    url: "https://www.samhsa.gov/find-help/disaster-distress-helpline",
    icon: CloudLightning,
    color: "from-slate-500 to-gray-600",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/20",
    category: "Disaster & Emergency",
  },
  {
    name: "National Parent Helpline",
    description: "Emotional support and resources for parents from trained advocates. Available weekdays.",
    phone: "1-855-427-2736",
    url: "https://www.nationalparenthelpline.org/",
    icon: Users,
    color: "from-amber-400 to-yellow-600",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
    category: "Family & Parenting",
  },
  {
    name: "Boys Town National Hotline",
    description: "24/7 crisis, resource, and referral helpline for kids, teens, and parents dealing with any issue.",
    phone: "1-800-448-3000",
    url: "https://www.boystown.org/hotline",
    icon: GraduationCap,
    color: "from-blue-400 to-cyan-600",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
    category: "Youth & Children",
  },
  {
    name: "Autism Society Helpline",
    description: "Information, referrals, and support for individuals on the autism spectrum and their families.",
    phone: "1-800-328-8476",
    url: "https://autismsociety.org/",
    icon: Accessibility,
    color: "from-fuchsia-500 to-pink-600",
    bgColor: "bg-fuchsia-500/10",
    borderColor: "border-fuchsia-500/20",
    category: "Disability & Neurodiversity",
  },
];

const CrisisResources = () => {
  const { t } = useI18n();
  const cd = t.crisisDirectory;

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showChecklist, setShowChecklist] = useState(() => {
    const fromCrisis = localStorage.getItem("crisis_redirect_time");
    if (fromCrisis) {
      localStorage.removeItem("crisis_redirect_time");
      return true;
    }
    return false;
  });

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesCategory = activeCategory === "All" || r.category === activeCategory;
      const matchesSearch =
        !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        (r.phone?.toLowerCase().includes(search.toLowerCase()) ?? false);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  if (showChecklist) {
    return <SafetyCheckScreen onContinue={() => setShowChecklist(false)} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {cd.backToHome}
          </Link>

          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-destructive/15 border border-destructive/30">
            <Phone className="w-8 h-8 text-destructive" />
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {cd.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {cd.subtitle}
          </p>

          {/* Urgent banner */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-destructive/15 border border-destructive/30">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
            </span>
            <span className="text-sm font-semibold text-destructive">
              {cd.urgentBanner
                .replace("{911}", "")
                .replace("{988}", "")
                .split(/(\s+)/)
                .map((word, i) => <span key={i}>{word}</span>)}
              {" "}
              <a href="tel:911" className="underline font-bold">911</a>
              {" / "}
              <a href="tel:988" className="underline font-bold">988</a>
            </span>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="pb-6 px-4">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={cd.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {categoryKeys.map((key, idx) => {
              const catId = categoryIds[idx];
              const label = cd[key];
              return (
                <button
                  key={catId}
                  onClick={() => setActiveCategory(catId)}
                  className={`px-4 py-1.5 rounded-full text-xs tracking-[0.1em] uppercase border transition-all ${
                    activeCategory === catId
                      ? "border-primary/60 text-primary bg-primary/10"
                      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Result count */}
          <p className="text-center text-xs text-muted-foreground">
            {cd.showing.replace("{count}", String(filtered.length)).replace("{total}", String(resources.length))}
          </p>
        </div>
      </section>

      {/* Resource Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((resource) => (
                <CrisisResourceCard key={resource.name} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {cd.noResults} "<span className="text-foreground">{search}</span>"
                {activeCategory !== "All" && (
                  <> {cd.inCategory} <span className="text-foreground">{cd[categoryKeys[categoryIds.indexOf(activeCategory as typeof categoryIds[number])]]}</span></>
                )}
              </p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("All"); }}
                className="mt-3 text-primary text-sm hover:underline"
              >
                {cd.clearFilters}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="rounded-2xl border border-border bg-card p-8">
            <p className="text-foreground font-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {cd.notAlone}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {cd.notSureText.split("{988}").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <strong>988</strong>}
                </span>
              ))}
            </p>
            <a
              href="tel:988"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary-foreground transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}
            >
              <Phone className="w-5 h-5" />
              {cd.callOrText988}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CrisisResources;
