import { Mail, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/safehelphublogo.jpg";
import { useI18n } from "@/i18n/I18nContext";

const Footer = () => {
  const { t } = useI18n();

  const quickLinks = [
    { label: t.nav.home, href: "#home" },
    { label: t.nav.resources, href: "#resources" },
    { label: t.footer.crisisResources, href: "/crisis-resources" },
    { label: t.nav.about, href: "#about" },
    { label: t.nav.contact, href: "#contact" },
  ];

  return (
    <footer id="contact" role="contentinfo" aria-label="Site footer" className="border-t border-border/40 bg-card/30 relative">
      <div className="absolute top-0 left-0 right-0 h-px opacity-20" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gradient-start)), hsl(var(--gradient-end)), transparent)" }} />
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-14">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-[1.5px] rounded-lg" style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}>
              <img src={logo} alt="Polly AI logo" className="w-8 h-8 rounded-[6px] object-cover" />
              </div>
              <span className="text-sm font-bold tracking-[0.15em] uppercase bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" }}>
                Polly AI
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-[1.8] max-w-sm">{t.footer.tagline}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {t.footer.quickLinks}
            </h4>
            <div className="space-y-3">
              {quickLinks.map((link) =>
                link.href.startsWith("/") ? (
                  <Link key={link.label} to={link.href} className="flex items-center gap-2.5 text-muted-foreground hover:text-primary text-sm transition-colors group">
                    <div className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-colors" />
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} className="flex items-center gap-2.5 text-muted-foreground hover:text-primary text-sm transition-colors group">
                    <div className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-colors" />
                    {link.label}
                  </a>
                )
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {t.footer.getInTouch}
            </h4>
            <a href="mailto:safehubhelp@zohomail.com" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors">
              <Mail className="w-4 h-4" /> safehubhelp@zohomail.com
            </a>
            <p className="text-muted-foreground text-xs mt-5 leading-[1.7]">{t.footer.suggestResource}</p>
          </div>
        </div>

        <div className="mt-16 pt-7">
          <div className="h-px opacity-10 mb-7" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gradient-start)), hsl(var(--gradient-end)), transparent)" }} />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-xs tracking-wider">
              {t.footer.copyright.replace("{year}", String(new Date().getFullYear()))}
            </p>
            <p className="text-muted-foreground text-xs flex items-center gap-1.5">
              {t.footer.madeWith} <Heart className="w-3 h-3 text-primary" /> {t.footer.forThose}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
