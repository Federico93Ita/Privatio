import ScrollReveal from "@/components/ui/ScrollReveal";

const features = [
  {
    title: "0% commissione venditore",
    description: "Nessuna commissione a carico del venditore. Il ricavato della vendita è interamente tuo.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: "from-emerald-500/10 to-emerald-500/5",
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Agenzie verificate e locali",
    description: "Collaboriamo esclusivamente con agenzie certificate e profondamente radicate nel territorio.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    accent: "from-blue-500/10 to-blue-500/5",
    iconBg: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Supporto fino alla vendita",
    description: "Un consulente dedicato ti accompagna in ogni fase, dalla scelta dell'agenzia fino al rogito notarile.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    accent: "from-[#C9A84C]/10 to-[#C9A84C]/5",
    iconBg: "bg-[#C9A84C]/10 text-[#C9A84C]",
  },
  {
    title: "Visibilità su tutti i portali",
    description: "Dopo aver scelto l'agenzia, il tuo annuncio viene pubblicato su Immobiliare.it, Idealista, Casa.it e tutti i principali portali.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    accent: "from-purple-500/10 to-purple-500/5",
    iconBg: "bg-purple-500/10 text-purple-600",
  },
];

export default function WhyPrivatio() {
  return (
    <section className="relative bg-white py-24 md:py-32 overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute left-[-5%] top-[20%] w-64 h-64 rounded-full bg-[#C9A84C]/[0.02] blur-[80px]" />
      <div className="absolute right-[-5%] bottom-[20%] w-48 h-48 rounded-full bg-[#0B1D3A]/[0.02] blur-[60px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-20 text-center">
            <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C] mb-4">I nostri vantaggi</span>
            <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-5xl">
              Perché scegliere Privatio
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-[#0B1D3A]/50 sm:text-lg leading-relaxed">
              Tutto ciò che serve per vendere in tranquillità, senza commissioni.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 items-stretch">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.1} className="h-full">
              <div className="group relative h-full flex flex-col rounded-3xl border border-transparent bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-black/[0.04] hover:-translate-y-1 hover:border-[#C9A84C]/15 overflow-hidden">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-3xl`} />

                <div className="relative">
                  <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.iconBg} transition-transform duration-500 group-hover:scale-110`}>
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 font-heading text-xl font-normal text-[#0B1D3A]">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#0B1D3A]/50">
                    {feature.description}
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
