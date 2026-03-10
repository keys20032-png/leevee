import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { zh } from "./zh";
import { ar } from "./ar";

export type Translations = typeof en;
export type Lang = "en" | "es" | "fr" | "zh" | "ar";

const translations: Record<Lang, Translations> = { en, es: es as Translations, fr: fr as Translations, zh: zh as Translations, ar: ar as Translations };

export const languages: { code: Lang; label: string; short: string; flag: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", short: "EN", flag: "🇺🇸", dir: "ltr" },
  { code: "es", label: "Español", short: "ES", flag: "🇪🇸", dir: "ltr" },
  { code: "fr", label: "Français", short: "FR", flag: "🇫🇷", dir: "ltr" },
  { code: "zh", label: "中文", short: "ZH", flag: "🇨🇳", dir: "ltr" },
  { code: "ar", label: "العربية", short: "AR", flag: "🇸🇦", dir: "rtl" },
];

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: en,
  dir: "ltr",
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    return saved && translations[saved] ? saved : "en";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  const langInfo = languages.find((l) => l.code === lang)!;

  useEffect(() => {
    document.documentElement.setAttribute("dir", langInfo.dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang, langInfo.dir]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang], dir: langInfo.dir }}>
      {children}
    </I18nContext.Provider>
  );
};
