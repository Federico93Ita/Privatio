import ScrollReveal from "@/components/ui/ScrollReveal";

const steps = [
  {
    num: "01",
    title: "Inserisci il tuo immobile",
    description: "Gratis e in soli 5 minuti. Carica foto e descrizione del tuo immobile sulla piattaforma.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Scegli la tua agenzia",
    description: "Consulta la lista delle agenzie partner nella tua zona e contatta direttamente quella che preferisci.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Incassi il 100%",
    description: "L'agenzia gestisce tutto: visite, trattativa, documentazione. Tu non paghi nessuna commissione.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="come-funziona" className="relative bg-[#F8F6F1] py-24 md:py-32 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
      <div className="absolute right-[-5%] top-[10%] w-72 h-72 rounded-full bg-[#C9A84C]/[0.03] blur-[80px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-20 text-center">
            <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C] mb-4">Come funziona</span>
            <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-5xl">
              Tre semplici passaggi
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-[#0B1D3A]/50 sm:text-lg leading-relaxed">
              Per vendere il tuo immobile senza commissioni.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-0">
          {steps.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 0.15}>
              <div className="relative group">
                {/* Connecting line between steps (desktop only) */}
                {i < 2 && (
                  <div className="absolute top-16 left-[calc(50%+40px)] right-0 hidden md:block">
                    <div className="h-px w-full bg-gradient-to-r from-[#C9A84C]/30 to-[#C9A84C]/5" />
                  </div>
                )}

                <div className="relative rounded-3xl bg-white p-8 md:p-10 text-center shadow-sm border border-[#C9A84C]/[0.08] transition-all duration-500 hover:shadow-xl hover:shadow-[#C9A84C]/[0.06] hover:-translate-y-1 group-hover:border-[#C9A84C]/20">
                  {/* Step number — large, decorative */}
                  <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                    {/* Background ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C9A84C]/10 to-[#C9A84C]/5 transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-1 rounded-full bg-white" />
                    <span className="relative text-2xl font-semibold bg-gradient-to-br from-[#C9A84C] to-[#B8943B] bg-clip-text text-transparent">
                      {step.num}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1D3A]/[0.03] text-[#0B1D3A]/40 transition-colors duration-300 group-hover:bg-[#C9A84C]/10 group-hover:text-[#C9A84C]">
                    {step.icon}
                  </div>

                  <h3 className="mb-3 font-heading text-xl font-normal text-[#0B1D3A]">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#0B1D3A]/50 max-w-[280px] mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
