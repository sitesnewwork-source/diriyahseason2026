import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import BackButton from "@/components/BackButton";
import { articles } from "@/data/articles";

const Articles = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;
  const ReadMoreArrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <SEOHead title={isAr ? "مقالات" : "Articles"} description={isAr ? "مقالات ومحتوى ثقافي عن الدرعية" : "Articles and cultural content about Diriyah"} path="/articles" />
      <Header />

      <section className="pt-20 sm:pt-28 pb-6 sm:pb-8 bg-gradient-to-b from-gold/5 to-background dark:from-gold/10 dark:to-background">
        <div className="container mx-auto px-6">
          <BackButton />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={isAr ? "text-right" : "text-left"}>
            <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm mb-4">
              <Link to="/" className="hover:text-foreground transition-colors">{isAr ? "الرئيسية" : "Home"}</Link>
              <ChevronIcon className="w-3 h-3" />
              <span className="text-foreground">{isAr ? "مقالات" : "Articles"}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3">
              {isAr ? "مقالات" : "Articles"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              {isAr ? "اقرأ عن تاريخ الدرعية وثقافتها ووجهاتها المميزة" : "Read about Diriyah's history, culture, and unique destinations"}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-8">
        <div className="container mx-auto px-6">
          <Link to={`/article/${articles[0].id}`} className="group block">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative aspect-[21/9] rounded-lg overflow-hidden dark:ring-1 dark:ring-border">
              <img src={articles[0].image} alt={isAr ? articles[0].title : articles[0].titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent dark:from-black/80" />
              <div className={`absolute bottom-0 left-0 right-0 p-6 md:p-10 ${isAr ? "text-right" : "text-left"}`}>
                <span className="inline-block bg-primary text-primary-foreground text-xs px-3 py-1 rounded-md mb-3">
                  {isAr ? articles[0].category : articles[0].categoryEn}
                </span>
                <h2 className="font-display text-xl md:text-3xl font-bold text-white mb-2">
                  {isAr ? articles[0].title : articles[0].titleEn}
                </h2>
                <p className="text-white/70 text-sm md:text-base max-w-2xl hidden sm:block">
                  {isAr ? articles[0].excerpt : articles[0].excerptEn}
                </p>
              </div>
            </motion.div>
          </Link>
        </div>
      </section>

      <section className="pb-10 sm:pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
            {articles.slice(1).map((article, i) => (
              <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link to={`/article/${article.id}`} className="group block">
                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-4 dark:ring-1 dark:ring-border">
                    <img src={article.image} alt={isAr ? article.title : article.titleEn} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className={`absolute top-3 ${isAr ? "right-3" : "left-3"} bg-muted/90 backdrop-blur-sm text-foreground text-xs px-3 py-1 rounded-md`}>
                      {isAr ? article.category : article.categoryEn}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{isAr ? article.date : article.dateEn}</p>
                  <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {isAr ? article.title : article.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{isAr ? article.excerpt : article.excerptEn}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-primary mt-3 font-medium">
                    {isAr ? "اقرأ المزيد" : "Read More"}
                    <ReadMoreArrow className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Articles;
