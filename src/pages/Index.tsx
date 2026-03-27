import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import HeroSection from "@/components/HeroSection";
import MarqueeBanner from "@/components/MarqueeBanner";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import SectionDivider from "@/components/SectionDivider";

// Lazy load below-fold sections
const EventsSection = lazy(() => import("@/components/EventsSection"));
const ExperienceSection = lazy(() => import("@/components/ExperienceSection"));
const StatsSection = lazy(() => import("@/components/StatsSection"));
const PromoBanner = lazy(() => import("@/components/PromoBanner"));
const HistoryBanner = lazy(() => import("@/components/HistoryBanner"));
const PlacesSection = lazy(() => import("@/components/PlacesSection"));
const RestaurantsPreview = lazy(() => import("@/components/RestaurantsPreview"));
const SchoolBanner = lazy(() => import("@/components/SchoolBanner"));
const InstagramSection = lazy(() => import("@/components/InstagramSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const CTABanner = lazy(() => import("@/components/CTABanner"));
const PartnersSection = lazy(() => import("@/components/PartnersSection"));

const SectionFallback = () => (
  <div className="w-full h-32 flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <SEOHead title="الدرعية" description="اكتشفوا الدرعية - الوجهة التاريخية والثقافية للمملكة العربية السعودية. زوروا مطل البجيري وحي الطريف التاريخي." path="/" />
      <Header />
      <HeroSection />

      <MarqueeBanner />

      <Suspense fallback={<SectionFallback />}>
        <ScrollReveal animation="fade-up">
          <EventsSection />
        </ScrollReveal>
      </Suspense>

      <SectionDivider />

      <Suspense fallback={<SectionFallback />}>
        <ScrollReveal animation="fade-up" delay={0.1}>
          <ExperienceSection />
        </ScrollReveal>
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ScrollReveal animation="fade">
          <StatsSection />
        </ScrollReveal>
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ScrollReveal animation="zoom" duration={0.9}>
          <PromoBanner />
        </ScrollReveal>
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ScrollReveal animation="fade">
          <HistoryBanner />
        </ScrollReveal>
      </Suspense>

      <SectionDivider variant="gold" />

      <Suspense fallback={<SectionFallback />}>
        <ScrollReveal animation="fade-up">
          <PlacesSection />
        </ScrollReveal>
      </Suspense>

      <SectionDivider />

      <Suspense fallback={<SectionFallback />}>
        <ScrollReveal animation="fade-up" delay={0.1}>
          <RestaurantsPreview />
        </ScrollReveal>
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ScrollReveal animation="fade-right" duration={0.8}>
          <SchoolBanner />
        </ScrollReveal>
      </Suspense>

      <MarqueeBanner />

      <Suspense fallback={<SectionFallback />}>
        <ScrollReveal animation="fade-up">
          <InstagramSection />
        </ScrollReveal>
      </Suspense>

      <SectionDivider variant="gold" />

      <Suspense fallback={<SectionFallback />}>
        <ScrollReveal animation="fade-up">
          <FAQSection />
        </ScrollReveal>
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <PartnersSection />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ScrollReveal animation="fade-up">
          <CTABanner />
        </ScrollReveal>
      </Suspense>

      <Footer />
    </div>
  );
};

export default Index;
