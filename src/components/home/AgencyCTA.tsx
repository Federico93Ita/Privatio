import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import CountdownBadge from "@/components/ui/CountdownBadge";
import { LAUNCH_CONFIG } from "@/lib/launch-config";

const benefits = [
  "Numero chiuso di agenzie nella tua zona. Niente bidding, niente gara al ribasso.",
  "Abbonamento mensile fisso per microzona OMI. Zero commissioni sulle vendite.",
  "I venditori ti scelgono direttamente durante il caricamento del loro immobile.",
  "Dashboard completa: lead, immobili, visite e KPI di zona sempre sotto controllo.",
];

export default function AgencyCTA() {
  return (
    <section className="relative py-24 md:py-32 bg-[#F8F6F1] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/15 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-5xl rounded-[2rem] mesh-navy relative overflow-hidden grain">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C9A84C]/0 via-[#C9A84C] to-[#C9A84C]/0" />

            <div className="relative p-10 md:p-16 lg:p-20">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left */}
                <div>
                  <span className="eyebrow text-[#C9A84C]/70">Per le agenzie</span>
                  <h2 className="mt-4 font-heading text-4xl font-normal tracking-[-0.025em] text-white sm:text-5xl leading-[1.05]">
                    La tua zona. <br />
                    <span className="ink-gold">Zero competizione.</span>
                  </h2>
                  <p className="mt-6 text-base leading-relaxed text-white/60 sm:text-lg">
                    Presidia una microzona OMI con un abbonamento mensile fisso.
                    Zero commissioni, lead dai venditori che scelgono te.
                  </p>

                  <div className="mt-8">
                    <CountdownBadge
                      deadline={LAUNCH_CONFIG.founderOfferDeadline}
                      label="Offerta Fondatore"
                    />
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/agenzie"
                      className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] px-8 py-4 text-base font-semibold text-[#0B1D3A] shadow-lg shadow-[#C9A84C]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#C9A84C]/30 hover:-translate-y-0.5 overflow-hidden"
                    >
                      <span className="relative z-10">Riserva la tua zona</span>
                      <svg className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </Link>
                    <Link
                      href="/agenzie#prezzi"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-7 py-3.5 text-base font-medium text-white/80 transition-all hover:text-white hover:border-white/40 hover:bg-white/5"
                    >
                      Vedi i prezzi
                    </Link>
                  </div>
                  <p className="mt-4 text-xs text-white/40">
                    3 mesi gratis · prezzo bloccato 12 mesi · disdici quando vuoi
                  </p>
                </div>

                {/* Right */}
                <div className="space-y-5">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-4 group/item">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/10 transition-colors duration-300 group-hover/item:bg-[#C9A84C]/20">
                        <svg className="h-4 w-4 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="text-sm md:text-base text-white/70 leading-relaxed pt-1 transition-colors duration-300 group-hover/item:text-white/90">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
