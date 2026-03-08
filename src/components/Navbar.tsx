import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/safehelphublogo.jpg";
import ThemeToggle from "@/components/ThemeToggle";
import TextSizeToggle from "@/components/TextSizeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/i18n/I18nContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const navLinks = [
    { label: t.nav.home, href: "#home" },
    { label: t.nav.resources, href: "#resources" },
    { label: t.nav.about, href: "#about" },
    { label: t.nav.contact, href: "#contact" },
  ];

  return (
    <nav aria-label="Main navigation" className="fixed top-[44px] sm:top-[40px] left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <a href="#home" className="flex items-center gap-3 group">
          <div className="p-[1.5px] rounded-lg transition-transform group-hover:scale-105" style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))" }}>
          <img src={logo} alt="Leevee AI logo" className="w-8 h-8 rounded-[6px] object-cover" />
          </div>
          <span
            className="text-sm font-bold tracking-[0.15em] uppercase bg-clip-text text-transparent hidden sm:inline"
            style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Leevee AI
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-muted-foreground hover:text-foreground text-xs tracking-[0.12em] uppercase transition-colors font-medium py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-primary after:scale-x-0 after:transition-transform hover:after:scale-x-100 after:origin-center"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {link.label}
            </a>
          ))}
          <div className="w-px h-5 bg-border/50 mx-1" />
          <LanguageSelector />
          <TextSizeToggle />
          <ThemeToggle />
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background rounded-md p-1.5"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" role="menu" className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 px-6 pb-5 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-muted-foreground hover:text-primary text-sm tracking-[0.12em] uppercase transition-colors py-3 border-b border-border/30 last:border-0 font-medium focus:outline-none focus:text-primary"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3 pt-3">
            <LanguageSelector />
            <TextSizeToggle />
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
