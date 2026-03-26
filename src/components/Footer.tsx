import { useState, forwardRef } from "react";
import { MapPin, Phone, Mail, Instagram, Twitter, Youtube, Send } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { scrollToSection } from "@/lib/scroll";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { actionNotify } from "@/hooks/use-action-notify";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScroll = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollToSection(id), 400);
    } else {
      scrollToSection(id);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      actionNotify({ message: t("footer.invalidEmail"), icon: "⚠️", sound: "soft" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: trimmed });
    setLoading(false);
    if (error?.code === "23505") {
      actionNotify({ message: t("footer.subscribeSuccess"), icon: "✅", sound: "soft" });
      setEmail("");
      return;
    }
    if (error) {
      actionNotify({ message: isRtl ? "حدث خطأ، حاول مجدداً" : "Something went wrong", icon: "❌", sound: "soft" });
      return;
    }
    actionNotify({ message: t("footer.subscribeSuccess"), icon: "✅", sound: "soft" });
    setEmail("");
  };

  return (
    <footer className="bg-foreground">
      <div className="container mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className={`${isRtl ? "text-right" : "text-left"} col-span-2 sm:col-span-1`}>
            <Link to="/" className="inline-block mb-3 sm:mb-4">
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-background leading-none">{t("nav.logo")}</h3>
              <span className="text-[9px] sm:text-[10px] text-background/50 tracking-[0.3em]">{t("nav.tagline")}</span>
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed text-background/65">{t("footer.desc")}</p>
          </div>

          <div className={isRtl ? "text-right" : "text-left"}>
            <h4 className="font-display text-sm sm:text-base font-bold text-background mb-3 sm:mb-5">{t("footer.discover")}</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              {[
                { label: t("footer.placesVisit"), id: "places" },
                { label: t("footer.activities"), id: "experiences" },
                { label: t("footer.events"), id: "events" },
              ].map((l) => (
                <li key={l.id}>
                  <button onClick={() => handleScroll(l.id)} className="text-background/65 hover:text-gold transition-colors">
                    {l.label}
                  </button>
                </li>
              ))}
              <li>
                <Link to="/restaurants" className="text-background/65 hover:text-gold transition-colors">{t("footer.restaurants")}</Link>
              </li>
            </ul>
          </div>

          <div className={isRtl ? "text-right" : "text-left"}>
            <h4 className="font-display text-sm sm:text-base font-bold text-background mb-3 sm:mb-5">{t("footer.info")}</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              {[
                { label: t("footer.planVisit"), id: "hours" },
                { label: t("footer.faq"), id: "faq" },
              ].map((l) => (
                <li key={l.id}>
                  <button onClick={() => handleScroll(l.id)} className="text-background/65 hover:text-gold transition-colors">
                    {l.label}
                  </button>
                </li>
              ))}
              <li><Link to="/contact" className="text-background/65 hover:text-gold transition-colors">{t("footer.contactUs")}</Link></li>
              <li><Link to="/privacy" className="text-background/65 hover:text-gold transition-colors">{t("footer.privacy")}</Link></li>
              <li><Link to="/terms" className="text-background/65 hover:text-gold transition-colors">{t("footer.termsConditions")}</Link></li>
            </ul>
          </div>

          <div className={`${isRtl ? "text-right" : "text-left"} col-span-2 sm:col-span-1`}>
            <h4 className="font-display text-sm sm:text-base font-bold text-background mb-3 sm:mb-5">{t("footer.contactUs")}</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li className={`flex items-start gap-2 ${isRtl ? "justify-end" : "justify-start"}`}>
                <span className="text-background/65">{isRtl ? "الدرعية، الرياض" : "Diriyah, Riyadh"}</span>
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold/70 flex-shrink-0 mt-0.5" />
              </li>
              <li className={`flex items-center gap-2 ${isRtl ? "justify-end" : "justify-start"}`}>
                <span className="text-background/65" dir="ltr">+966 920 000 000</span>
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold/70" />
              </li>
              <li className={`flex items-center gap-2 ${isRtl ? "justify-end" : "justify-start"}`}>
                <span className="text-background/65">info@diriyah.sa</span>
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold/70" />
              </li>
            </ul>
            <div className={`flex items-center gap-2 mt-3 sm:mt-4 ${isRtl ? "justify-end" : "justify-start"}`}>
              {[
                { Icon: Instagram, url: "https://www.instagram.com/diriyahgate/" },
                { Icon: Twitter, url: "https://twitter.com/diriyahgate" },
                { Icon: Youtube, url: "https://www.youtube.com/@DiriyahGate" },
              ].map(({ Icon, url }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-background/20 flex items-center justify-center hover:bg-background/10 transition-all"
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-background/65" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className={`max-w-xl ${isRtl ? "mr-auto text-right" : "ml-auto text-left"} sm:mx-auto sm:text-center`}>
            <h4 className="font-display text-base sm:text-lg font-bold text-background mb-2">{t("footer.newsletter")}</h4>
            <p className="text-xs sm:text-sm text-background/60 mb-4">{t("footer.newsletterDesc")}</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 sm:px-5 py-2.5 bg-gold text-foreground text-xs sm:text-sm font-bold rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                {t("footer.subscribe")}
              </button>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("footer.emailPlaceholder")}
                className={`flex-1 px-4 py-2.5 bg-background/5 border border-background/20 rounded-lg text-xs sm:text-sm text-background placeholder:text-background/40 focus:outline-none focus:border-gold/50 transition-colors ${isRtl ? "text-right" : "text-left"}`}
                maxLength={255}
                dir={isRtl ? "rtl" : "ltr"}
              />
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <div className="flex gap-3 sm:gap-4 text-[10px] sm:text-xs text-background/45">
            <Link to="/privacy" className="hover:text-gold transition-colors">{isRtl ? "الخصوصية" : "Privacy"}</Link>
            <span>|</span>
            <Link to="/terms" className="hover:text-gold transition-colors">{isRtl ? "الشروط" : "Terms"}</Link>
          </div>
          <p className="text-[10px] sm:text-xs text-background/45">© {new Date().getFullYear()} {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
