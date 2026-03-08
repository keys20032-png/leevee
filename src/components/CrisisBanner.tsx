import { AlertCircle, Phone, MessageCircle, Globe, List } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";

const CrisisBanner = () => {
  const [showInternational, setShowInternational] = useState(false);
  const { t } = useI18n();

  const internationalHotlines = [
    { country: "🇺🇸 United States", name: "National Suicide Prevention Lifeline", number: "988", link: "tel:988" },
    { country: "🇯🇵 Japan", name: "TELL Lifeline", number: "03-5774-0992", link: "tel:0357740992" },
    { country: "🇰🇷 South Korea", name: "Korea Suicide Prevention Center", number: "1393", link: "tel:1393" },
    { country: "🇮🇳 India", name: "iCall / AASRA", number: "9820466726", link: "tel:9820466726" },
    { country: "🇧🇷 Brazil", name: "CVV", number: "188", link: "tel:188" },
    { country: "🇷🇺 Russia", name: "Phone of Trust", number: "8-800-2000-122", link: "tel:88002000122" },
    { country: "🇬🇧 United Kingdom", name: "Samaritans", number: "116 123", link: "tel:+441162123" },
    { country: "🇨🇦 Canada", name: "Talk Suicide Canada", number: "1-833-456-4566", link: "tel:18334564566" },
    { country: "🇦🇺 Australia", name: "Lifeline", number: "13 11 14", link: "tel:131114" },
    { country: "🇩🇪 Germany", name: "Telefonseelsorge", number: "0800 111 0 111", link: "tel:08001110111" },
    { country: "🇫🇷 France", name: "SOS Amitié", number: "09 72 39 40 50", link: "tel:0972394050" },
    { country: "🇿🇦 South Africa", name: "SADAG", number: "0800 567 567", link: "tel:0800567567" },
    { country: "🇳🇬 Nigeria", name: "SURPIN", number: "+234 806 210 6493", link: "tel:+2348062106493" },
    { country: "🇵🇭 Philippines", name: "Natasha Goulbourn Foundation", number: "(02) 804-4673", link: "tel:028044673" },
    { country: "🇹🇭 Thailand", name: "Samaritans of Thailand", number: "02-713-6793", link: "tel:027136793" },
    { country: "🇱🇹 Lithuania", name: "Emotional Support Line", number: "116 123", link: "tel:116123" },
    { country: "🇬🇾 Guyana", name: "Guyana Emergency", number: "223-0001", link: "tel:2230001" },
    { country: "🇸🇷 Suriname", name: "PCS Helpline", number: "477-0000", link: "tel:4770000" },
    { country: "🇪🇺 Europe", name: "Befrienders International", link: "https://www.befrienders.org/" },
    { country: "🌍 Global", name: "International Association for Suicide Prevention", link: "https://www.iasp.info/resources/Crisis_Centres/" },
  ];

  return (
    <div role="alert" aria-label="Crisis support information" className="w-full bg-destructive text-destructive-foreground py-2 px-4 z-[60] fixed top-0 left-0 right-0">
      <div className="max-w-7xl mx-auto">
        <a href="https://988lifeline.org/" className="sm:hidden flex items-center justify-center gap-2 font-bold text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{t.crisis.mobileTap}</span>
        </a>

        <div className="hidden sm:flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <a href="https://988lifeline.org/" target="_blank" rel="noopener noreferrer" className="font-bold text-lg hover:opacity-80 transition-opacity">988</a>
            <span className="text-destructive-foreground/70">—</span>
            <span className="font-semibold text-base">{t.crisis.inCrisis}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <a href="tel:988" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity font-semibold text-base">
              <Phone className="w-4 h-4" /> {t.crisis.call988}
            </a>
            <span className="text-destructive-foreground/70">•</span>
            <a href="sms:988" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity font-semibold text-base">
              <MessageCircle className="w-4 h-4" /> {t.crisis.text988}
            </a>
            <span className="text-destructive-foreground/70">•</span>
            <a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity font-semibold text-base">
              {t.crisis.chatOnline}
            </a>
            <span className="text-destructive-foreground/70">•</span>
            <button onClick={() => setShowInternational(!showInternational)} className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity font-semibold text-base">
              <Globe className="w-4 h-4" /> {t.crisis.international}
            </button>
            <span className="text-destructive-foreground/70">•</span>
            <Link to="/crisis-resources" className="inline-flex items-center gap-1.5 hover:opacity-80 transition-opacity font-semibold text-base">
              <List className="w-4 h-4" /> {t.crisis.allResources}
            </Link>
          </div>
        </div>

        {showInternational && (
          <div className="mt-3 pt-3 border-t border-destructive-foreground/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {internationalHotlines.map((hotline, idx) => (
              <div key={idx} className="text-xs sm:text-sm">
                <div className="font-semibold">{hotline.country}</div>
                <div className="opacity-90">{hotline.name}</div>
                {hotline.link.startsWith("tel:") ? (
                  <a href={hotline.link} className="hover:opacity-80 transition-opacity">{hotline.number}</a>
                ) : (
                  <a href={hotline.link} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">Visit Website</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrisisBanner;
