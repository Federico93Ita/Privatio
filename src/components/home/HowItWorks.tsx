import ScrollReveal from "@/components/ui/ScrollReveal";

const steps = [
  {
    num: 1,
    title: "Inserisci il tuo immobile",
    description: "Gratis e in soli 5 minuti. Carica foto e descrizione del tuo immobile.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  },
  {
    num: 2,
    title: "Scegli la tua agenzia",
    description: "Consulta la lista delle agenzie partner nella tua zona e contatta direttamente quella che preferisci.",
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  },
  {
    num: 3,
    title: "Incassi il 100%",
    description: "L'agenzia gestisce tutto: visite, trattativa, documentazione. Tu non paghi nulla.",
    icon: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
  },
];

export default function HowItWorks() {
  return (
    <section id="come-funziona" className="bg-[#F8F6F1] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-14 text-center">
            <h2 className="font-heading text-3xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-4xl">
              Come Funziona
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#0B1D3A]/60 sm:text-lg">
              Tre semplici passaggi per vendere il tuo immobile senza commissioni.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4 lg:gap-8">
          {steps.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 0.15}>
              <div className="relative rounded-2xl border border-[#C9A84C]/15 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                {/* Gold step number */}
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#C9A84C]/10 text-lg font-semibold text-[#C9A84C]">
                  {step.num}
                </div>

                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center">
                  <svg className="h-6 w-6 text-[#0B1D3A]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                  </svg>
                </div>

                <h3 className="mb-2 font-heading text-lg font-normal text-[#0B1D3A]">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#0B1D3A]/60">
                  {step.description}
                </p>

                {/* Connector arrow */}
                {i < 2 && (
                  <div className="absolute -right-5 top-1/2 hidden -translate-y-1/2 text-[#C9A84C]/30 md:block lg:-right-6">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
