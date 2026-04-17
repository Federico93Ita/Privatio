import ScrollReveal from "@/components/ui/ScrollReveal";
import SectionHeader from "@/components/ui/SectionHeader";

const steps = [
  {
    num: "01",
    title: "Pubblichi gratis",
    description:
      "5 minuti. Foto, descrizione, prezzo richiesto. Nessuna carta di credito, nessun contratto.",
    meta: "Oggi",
  },
  {
    num: "02",
    title: "Scegli tu l'agenzia",
    description:
      "Vedi chi opera nella tua microzona. Confronti profili, rating, commissione acquirente. Scegli o lascia scegliere al sistema.",
    meta: "Entro 48h",
  },
  {
    num: "03",
    title: "Incassi il 100%",
    description:
      "L'agenzia pubblica ovunque, organizza visite, tratta e ti porta al rogito. Tu non paghi nulla.",
    meta: "Al rogito",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="come-funziona"
      className="relative mesh-cream py-24 md:py-32 overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Come funziona"
          title={
            <>
              Tre passaggi. <span className="ink-gold">Zero commissioni.</span>
            </>
          }
          subtitle="Niente gare al ribasso, niente esclusive capestro. Tu pubblichi, scegli e incassi."
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 items-stretch">
          {steps.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 0.12} className="h-full">
              <div className="relative group h-full">
                {/* Connecting arrow between steps (desktop only) */}
                {i < 2 && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute top-[56px] left-full hidden md:flex items-center justify-center w-8 -translate-x-1/2 z-10"
                  >
                    <svg
                      className="h-4 w-4 text-[#C9A84C]/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                )}

                <div className="relative flex h-full flex-col rounded-3xl bg-white p-8 md:p-10 shadow-sm border border-[#C9A84C]/[0.08] transition-all duration-500 hover:shadow-xl hover:shadow-[#C9A84C]/[0.08] hover:-translate-y-1 group-hover:border-[#C9A84C]/25">
                  {/* Header row: big number + meta tag */}
                  <div className="flex items-start justify-between mb-8">
                    <span className="font-heading text-6xl md:text-7xl text-[#0B1D3A] leading-none">
                      {step.num}
                    </span>
                    <span className="rounded-full bg-[#C9A84C]/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[#C9A84C]">
                      {step.meta}
                    </span>
                  </div>

                  <h3 className="font-heading text-2xl md:text-3xl font-normal text-[#0B1D3A] leading-tight mb-4">
                    {step.title}
                  </h3>
                  <p className="text-base leading-relaxed text-[#0B1D3A]/60">
                    {step.description}
                  </p>

                  {/* Bottom gold accent line on hover */}
                  <div className="mt-auto pt-6">
                    <div className="h-px w-12 bg-[#C9A84C]/30 transition-all duration-500 group-hover:w-full" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
