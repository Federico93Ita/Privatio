import ScrollReveal from "@/components/ui/ScrollReveal";
import { formatPrice } from "@/lib/utils";

/**
 * "Scenari di risparmio" — esempi illustrativi del risparmio netto
 * rispetto a un'agenzia tradizionale (commissione ~3% IVA esclusa).
 * Sostituiranno veri testimonial dopo le prime vendite con clienti reali.
 */
const scenarios = [
  {
    propertyType: "Bilocale 65 m²",
    area: "Milano — Navigli",
    salePrice: 380_000,
    traditionalFee: 11_400, // 3% IVA excl
    privatioFee: 0,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    propertyType: "Trilocale 95 m²",
    area: "Roma — San Giovanni",
    salePrice: 320_000,
    traditionalFee: 9_600,
    privatioFee: 0,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    propertyType: "Villa bifamiliare",
    area: "Torino — Collina",
    salePrice: 520_000,
    traditionalFee: 15_600,
    privatioFee: 0,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.5m0 0V9.75A2.25 2.25 0 0110.5 7.5h3a2.25 2.25 0 012.25 2.25v6.75m-7.5 0h7.5M3 21h18M3 10.5l9-7.5 9 7.5" />
      </svg>
    ),
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative bg-[#0B1D3A] py-24 md:py-32 overflow-hidden grain">
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#C9A84C]/[0.04] blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#C9A84C]/[0.03] blur-[80px]" />

      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <span className="eyebrow text-[#C9A84C]/80 mb-4">Quanto costa davvero il 3%</span>
            <h2 className="h-section text-white mt-2">
              Ecco cosa avresti <span className="ink-gold">nel conto corrente.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/60 sm:text-lg leading-relaxed">
              Tre vendite reali che avvengono ogni giorno in Italia. Stesso prezzo, stesso rogito. Diverso saldo finale.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-stretch">
          {scenarios.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.15} className="h-full">
              <div className="group relative h-full flex flex-col justify-between rounded-3xl border border-white/[0.06] bg-white/[0.03] p-8 transition-all duration-500 hover:bg-white/[0.07] hover:border-white/[0.12] overflow-hidden md:p-9">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9A84C]/15 to-[#C9A84C]/5 text-[#C9A84C]">
                      {s.icon}
                    </div>
                    <span className="text-xs text-[#C9A84C]/60 uppercase tracking-wider">
                      Esempio
                    </span>
                  </div>

                  <h3 className="font-heading text-2xl text-white leading-tight">
                    {s.propertyType}
                  </h3>
                  <p className="mt-1 text-sm text-white/50">{s.area}</p>

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Prezzo di vendita</span>
                      <span className="font-semibold text-white">{formatPrice(s.salePrice)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Agenzia tradizionale (~3%)</span>
                      <span className="font-semibold text-white/80 line-through">{formatPrice(s.traditionalFee)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                      <span className="text-white/50">Con Privatio</span>
                      <span className="font-semibold text-[#C9A84C]">€0</span>
                    </div>
                  </div>
                </div>

                {/* Savings badge */}
                <div className="relative mt-8 border-t border-white/[0.06] pt-6">
                  <p className="text-[11px] text-white/40 uppercase tracking-[0.15em] mb-2">Risparmio netto</p>
                  <p className="font-heading text-3xl text-[#C9A84C]">
                    {formatPrice(s.traditionalFee - s.privatioFee)}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Disclaimer + CTA */}
        <ScrollReveal delay={0.5}>
          <div className="mt-14 text-center">
            <p className="mx-auto max-w-2xl text-xs text-white/40 leading-relaxed">
              Esempi illustrativi basati su commissione media del 3% (IVA
              esclusa) applicata dalle agenzie tradizionali. Il risparmio reale
              dipende dal prezzo finale e dall&apos;accordo con la tua agenzia
              partner.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
