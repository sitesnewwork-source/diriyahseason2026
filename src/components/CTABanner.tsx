import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const CTABanner = () => {
  const { isRtl } = useLanguage();
  const navigate = useNavigate();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="py-16 sm:py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Decorative triangles */}
      <div className="absolute top-0 left-0 w-64 h-64 opacity-[0.03]">
        <div className="w-0 h-0 border-r-[256px] border-r-transparent border-t-[256px] border-t-foreground" />
      </div>
      <div className="absolute bottom-0 right-0 w-48 h-48 opacity-[0.03]">
        <div className="w-0 h-0 border-l-[192px] border-l-transparent border-b-[192px] border-b-foreground" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            {isRtl ? "ابدأ رحلتك\nإلى الدرعية" : "Start Your Journey\nto Diriyah"}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed">
            {isRtl
              ? "احجز تذكرتك الآن واستمتع بتجربة لا تُنسى في قلب التاريخ والثقافة السعودية"
              : "Book your ticket now and enjoy an unforgettable experience in the heart of Saudi history and culture"}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/checkout")}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-accent-foreground font-bold rounded-sm hover:bg-accent/90 transition-colors text-sm sm:text-base btn-press"
            >
              <span>{isRtl ? "احجز تذكرتك" : "Book Your Ticket"}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/experiences")}
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-foreground/15 text-foreground font-bold rounded-sm hover:border-foreground/30 transition-colors text-sm sm:text-base btn-press"
            >
              <span>{isRtl ? "استكشف التجارب" : "Explore Experiences"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
