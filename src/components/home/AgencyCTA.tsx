import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

const benefits = [
  "I venditori nella tua zona possono trovarti e contattarti direttamente",
  "Abbonamento territoriale: investi nella tua zona e ricevi lead continui",
  "Dashboard dedicata per gestire immobili e visite",
  "Supporto marketing e visibilità su tutti i portali",
];

export default function AgencyCTA() {
  return (
    <section className="relative py-24 md:py-32 bg-[#F8F6F1] overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/15 to-transparent" />
      <div className="absolute right-[10%] top-[20%] w-48 h-48 rounded-full bg-[#C9A84C]/[0.04] blur-[60px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-4xl rounded-[2rem] bg-[#0B1D3A] relative overflow-hidden">
            {/* Inner decorative elements */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C9A84C]/0 via-[#C9A84C] to-[#C9A84C]/0" />
            <div className="absolute top-[-30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#C9A84C]/[0.04] blur-[80px]" />
            <div className="absolute bottom-[-20%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#C9A84C]/[0.03] blur-[60px]" />

            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative p-10 md:p-16 lg:p-20">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left: text */}
                <div>
                  <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C]/60 mb-4">Per le agenzie</span>
                  <h2 className="font-heading text-3xl font-normal tracking-[-0.02em] text-white sm:text-4xl lg:text-[2.75rem] leading-[1.15]">
                    Unisciti alla rete di agenzie partner
                  </h2>
                  <p className="mt-5 text-base leading-relaxed text-white/40 sm:text-lg">
                    Lasciati trovare dai venditori nella tua zona e ricevi lead qualificati ogni giorno.
                  </p>

                  <div className="mt-10">
                    <Link
                      href="/agenzie"
                      className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] px-8 py-4 text-base font-medium text-[#0B1D3A] shadow-lg shadow-[#C9A84C]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#C9A84C]/30 hover:-translate-y-0.5 overflow-hidden"
                    >
                      <span className="relative z-10">Diventa Partner</span>
                      <svg className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </Link>
                  </div>
                </div>

                {/* Right: benefits */}
                <div className="space-y-5">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-4 group/item">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/10 transition-colors duration-300 group-hover/item:bg-[#C9A84C]/20">
                        <svg className="h-4 w-4 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="text-sm text-white/50 leading-relaxed pt-1 transition-colors duration-300 group-hover/item:text-white/70">{benefit}</span>
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
