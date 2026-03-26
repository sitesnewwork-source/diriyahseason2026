import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import salwaImg from "@/assets/salwa-palace-night.jpg";
import placeTuraif from "@/assets/place-turaif.jpg";
import { useRef } from "react";

const HistoryBanner = () => {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  return (
    <section ref={ref} className="bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative aspect-[16/9] sm:aspect-[16/10] md:aspect-auto md:min-h-[400px] lg:min-h-[500px] overflow-hidden"
        >
          <motion.img src={salwaImg} alt="قصر سلوى" loading="lazy" width={1920} height={1080} className="w-full h-full object-cover" style={{ y: y1 }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative aspect-[16/9] sm:aspect-[16/10] md:aspect-auto md:min-h-[400px] lg:min-h-[500px] overflow-hidden"
        >
          <motion.img src={placeTuraif} alt="حي الطريف التاريخي" loading="lazy" width={1920} height={1080} className="w-full h-full object-cover" style={{ y: y2 }} />
          <div className="absolute inset-0 bg-earth/65 flex flex-col items-center justify-center text-center p-6 sm:p-8">
            <p className="text-cream/90 font-display text-lg sm:text-xl md:text-2xl max-w-sm leading-relaxed mb-6 sm:mb-8">
              {t("history.desc")}
            </p>
            <button
              onClick={() => navigate("/tickets")}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 border border-cream text-cream text-xs sm:text-sm rounded-sm hover:bg-cream hover:text-earth transition-all"
            >
              <span>{t("restaurants.bookNow")}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HistoryBanner;
