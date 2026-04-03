import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import SavingsCalc from "@/components/property/SavingsCalc";
import HowItWorks from "@/components/home/HowItWorks";
import WhyPrivatio from "@/components/home/WhyPrivatio";
import TrustBadges from "@/components/home/TrustBadges";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import HomeFAQ from "@/components/home/HomeFAQ";
import AgencyCTA from "@/components/home/AgencyCTA";
import LeadSection from "@/components/home/LeadSection";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Privatio",
  url: "https://privatio.it",
  description: "La prima piattaforma immobiliare italiana dove il venditore non paga commissioni.",
  areaServed: { "@type": "Country", name: "Italia" },
  priceRange: "Gratuito per i venditori",
  sameAs: [
    "https://instagram.com/privatio.it",
    "https://linkedin.com/company/privatio",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Devo pagare qualcosa per vendere su Privatio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, il servizio è completamente gratuito per il venditore. Né Privatio né l'agenzia convenzionata ti chiedono provvigioni. L'intero ricavato della vendita è tuo.",
      },
    },
    {
      "@type": "Question",
      name: "Quanto tempo ci vuole per vendere casa con Privatio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Inserire il tuo immobile richiede circa 5 minuti. Entro 24 ore ti mettiamo in contatto con un'agenzia partner nella tua zona, che si occuperà di tutto: visite, trattativa e documentazione.",
      },
    },
    {
      "@type": "Question",
      name: "Come guadagna Privatio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le agenzie partner pagano un abbonamento per essere presenti sulla piattaforma. Privatio non trattiene commissioni sulle vendite e non chiede nulla ai venditori.",
      },
    },
    {
      "@type": "Question",
      name: "Posso ritirare il mio annuncio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sì, puoi ritirare il tuo annuncio in qualsiasi momento dalla tua dashboard. Nessun vincolo, nessuna penale.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />
      <main id="main-content" className="overflow-hidden">
        <HeroSection />

        {/* Savings Calculator */}
        <section id="risparmio" className="relative bg-white py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <SavingsCalc />
            </ScrollReveal>
          </div>
        </section>

        <HowItWorks />
        <WhyPrivatio />

        {/* Trust Badges strip */}
        <TrustBadges />

        {/* Featured Properties */}
        <section className="relative bg-[#F8F6F1] py-24 md:py-32 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/15 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="mb-16 text-center">
                <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C] mb-4">In vetrina</span>
                <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-5xl">
                  Immobili in Vetrina
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-base text-[#0B1D3A]/50 sm:text-lg leading-relaxed">
                  Scopri alcune delle proprietà attualmente in vendita sulla nostra piattaforma.
                </p>
              </div>
            </ScrollReveal>
            <FeaturedProperties />
            <div className="mt-14 text-center">
              <Link
                href="/cerca"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-[#C9A84C]/20 bg-white px-7 py-3.5 text-sm font-medium text-[#0B1D3A] shadow-sm transition-all duration-300 hover:bg-[#C9A84C]/5 hover:border-[#C9A84C]/40 hover:shadow-md hover:-translate-y-0.5"
              >
                Vedi tutti gli immobili
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <TestimonialsSection />
        <HomeFAQ />
        <AgencyCTA />
        <LeadSection />
      </main>
      <Footer />
      <MobileStickyBar />
    </>
  );
}
