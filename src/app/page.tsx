import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import SavingsCalc from "@/components/property/SavingsCalc";
import HowItWorks from "@/components/home/HowItWorks";
import WhyPrivatio from "@/components/home/WhyPrivatio";
import FeaturedProperties from "@/components/home/FeaturedProperties";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import AgencyCTA from "@/components/home/AgencyCTA";
import LeadSection from "@/components/home/LeadSection";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main-content" className="overflow-hidden">
        <HeroSection />

        {/* Savings Calculator */}
        <section id="risparmio" className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SavingsCalc />
          </div>
        </section>

        <HowItWorks />
        <WhyPrivatio />

        {/* Featured Properties */}
        <section className="bg-[#F8F6F1] py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="mb-14 text-center">
                <h2 className="font-heading text-3xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-4xl">
                  Immobili in Vetrina
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base text-[#0B1D3A]/60 sm:text-lg">
                  Scopri alcune delle proprietà attualmente in vendita sulla nostra piattaforma.
                </p>
              </div>
            </ScrollReveal>
            <FeaturedProperties />
            <div className="mt-12 text-center">
              <Link
                href="/cerca"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#C9A84C]/30 bg-transparent px-6 py-3 text-sm font-medium text-[#0B1D3A] transition-all duration-300 hover:bg-[#C9A84C]/5 hover:border-[#C9A84C]/50"
              >
                Vedi tutti gli immobili
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <TestimonialsSection />
        <AgencyCTA />
        <LeadSection />
      </main>
      <Footer />
    </>
  );
}
