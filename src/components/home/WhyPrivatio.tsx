import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionHeader from "@/components/ui/SectionHeader";

const rows = [
  {
    label: "Commissione venditore",
    traditional: "3% + IVA",
    privatio: "0%",
    winner: "privatio",
  },
  {
    label: "Chi sceglie l'agenzia",
    traditional: "Chi ti trova per primo",
    privatio: "Sei tu a sceglierla",
    winner: "privatio",
  },
  {
    label: "Esclusiva forzata",
    traditional: "Sì, 6-12 mesi",
    privatio: "No, revocabile sempre",
    winner: "privatio",
  },
  {
    label: "Pubblicazione sui portali",
    traditional: "Sì",
    privatio: "Sì, inclusa",
    winner: "pari",
  },
  {
    label: "Numero di agenzie concorrenti",
    traditional: "Illimitato, gara al ribasso",
    privatio: "Numero chiuso per zona",
    winner: "privatio",
  },
  {
    label: "Costo per iscriversi",
    traditional: "Nessuno, ma pagherai dopo",
    privatio: "Gratis, sempre",
    winner: "privatio",
  },
];

function Check() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function Cross() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function WhyPrivatio() {
  return (
    <section className="relative bg-white py-24 md:py-32 overflow-hidden">
      <div className="absolute left-[-5%] top-[20%] w-64 h-64 rounded-full bg-[#C9A84C]/[0.03] blur-[80px]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Il confronto"
          title={
            <>
              Stessa vendita. <br className="sm:hidden" />
              <span className="ink-gold">Tu risparmi migliaia di euro.</span>
            </>
          }
          subtitle="Cosa cambia davvero fra Privatio e un'agenzia tradizionale che ti chiama dopo aver visto il tuo annuncio."
        />

        <ScrollReveal>
          <div className="overflow-hidden rounded-3xl border border-[#0B1D3A]/[0.08] shadow-xl shadow-[#0B1D3A]/[0.04]">
            {/* Header row */}
            <div className="grid grid-cols-[1.2fr_1fr_1fr] md:grid-cols-[1.5fr_1fr_1fr] bg-[#F8F6F1]">
              <div className="px-5 md:px-8 py-5 md:py-6">
                <span className="eyebrow text-[#0B1D3A]/50">Caratteristica</span>
              </div>
              <div className="px-4 md:px-8 py-5 md:py-6 text-center border-l border-[#0B1D3A]/[0.06]">
                <span className="block text-xs md:text-sm font-medium text-[#0B1D3A]/60 uppercase tracking-wide">
                  Agenzia tradizionale
                </span>
              </div>
              <div className="px-4 md:px-8 py-5 md:py-6 text-center bg-[#0B1D3A] text-white relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A84C] via-[#E0C96A] to-[#C9A84C]" />
                <span className="block font-heading text-lg md:text-xl">
                  Privatio
                </span>
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-[1.2fr_1fr_1fr] md:grid-cols-[1.5fr_1fr_1fr] items-center ${
                  i < rows.length - 1 ? "border-b border-[#0B1D3A]/[0.06]" : ""
                }`}
              >
                <div className="px-5 md:px-8 py-5 md:py-6 text-sm md:text-base font-medium text-[#0B1D3A]">
                  {row.label}
                </div>
                <div className="px-4 md:px-8 py-5 md:py-6 text-center border-l border-[#0B1D3A]/[0.06]">
                  <div className="flex items-center justify-center gap-2">
                    {row.winner === "privatio" ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <Cross />
                      </span>
                    ) : (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0B1D3A]/5 text-[#0B1D3A]/40">
                        <Check />
                      </span>
                    )}
                    <span className="text-xs md:text-sm text-[#0B1D3A]/60">
                      {row.traditional}
                    </span>
                  </div>
                </div>
                <div className="px-4 md:px-8 py-5 md:py-6 text-center bg-[#0B1D3A]/[0.02]">
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#C9A84C]/15 text-[#C9A84C]">
                      <Check />
                    </span>
                    <span className="text-xs md:text-sm font-semibold text-[#0B1D3A]">
                      {row.privatio}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="mt-8 text-center text-sm text-[#0B1D3A]/50">
            Confronto basato sulle condizioni standard del mercato italiano (commissione media 3% + IVA applicata al venditore).
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
