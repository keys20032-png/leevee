import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useI18n, languages } from "@/i18n/I18nContext";

const LanguageSelector = () => {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = languages.find((l) => l.code === lang)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm text-muted-foreground hover:text-primary hover:border-primary/30 transition-all text-xs"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="font-semibold uppercase md:inline hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{current.label}</span>
        <span className="font-semibold uppercase md:hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{current.short}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Language options"
          className="absolute top-full mt-2 left-0 md:left-auto md:right-0 bg-card border border-border/50 rounded-xl shadow-xl shadow-black/20 py-1.5 min-w-[170px] z-50 backdrop-blur-xl"
        >
          {languages.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={lang === l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
               className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                 lang === l.code
                   ? "text-primary bg-primary/10"
                   : "text-foreground hover:bg-muted hover:text-primary"
               }`}
             >
               <span className="text-base">{l.flag}</span>
               <span className="md:inline hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{l.label}</span>
               <span className="md:hidden" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{l.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
