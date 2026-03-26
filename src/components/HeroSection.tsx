import { useState, useEffect, useCallback } from "react";
import { playChime } from "@/hooks/use-action-sound";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { scrollToSection } from "@/lib/scroll";
import { useLanguage } from "@/i18n/LanguageContext";

import hero1 from "@/assets/hero-diriyah-1.jpg";
import hero2 from "@/assets/hero-diriyah-2.jpg";
import hero3 from "@/assets/hero-diriyah-3.jpg";

const HeroSection = () => {
  const { t, isRtl } = useLanguage();
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      image: hero1,
      title: t("hero.slide1.title"),
      subtitle: t("hero.slide1.subtitle"),
      cta: t("hero.slide1.cta"),
      target: "/checkout",
    },
    {
      image: hero2,
      title: t("hero.slide2.title"),
      subtitle: t("hero.slide2.subtitle"),
      cta: t("hero.slide1.cta"),
      target: "/checkout",
    },
    {
      image: hero3,
      title: t("hero.slide3.title"),
      subtitle: t("hero.slide3.subtitle"),
      cta: t("hero.slide3.cta"),
      target: "/restaurants",
    },
  ];

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const handleCTA = (target: string) => {
    if (target.startsWith("http")) {
      window.open(target, "_blank", "noopener,noreferrer");
    } else if (target.startsWith("/")) {
      navigate(target);
    } else {
      scrollToSection(target);
    }
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="relative h-[85vh] sm:h-screen min-h-[500px] sm:min-h-[600px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={slides[current].image}
          alt={slides[current].title}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-earth/80 via-earth/20 to-earth/40" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-cream leading-tight mb-3 sm:mb-4">
              {slides[current].title}
            </h1>
            <p className="text-cream/70 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              {slides[current].subtitle}
            </p>
            <button
              onClick={() => { playChime("click"); handleCTA(slides[current].target); }}
              className="inline-flex items-center gap-2 text-cream text-sm border-b border-cream/50 pb-1 hover:border-cream transition-all btn-press"
            >
              <span>{slides[current].cta}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { playChime("soft"); setCurrent(i); }}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? "w-3 h-3 border-2 border-cream bg-transparent"
                : "w-2 h-2 bg-cream/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
