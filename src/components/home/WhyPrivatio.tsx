import ScrollReveal from "@/components/ui/ScrollReveal";

const features = [
  {
    title: "0% commissione venditore",
    description: "Nessuna commissione a carico del venditore. Il ricavato della vendita è tutto tuo.",
    icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Agenzie verificate e locali",
    description: "Collaboriamo solo con agenzie certificate e radicate nel territorio.",
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  },
  {
    title: "Supporto dedicato fino alla vendita",
    description: "Un consulente ti segue in ogni fase, dalla pubblicazione al rogito.",
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  },
  {
    title: "Visibilità su tutti i portali",
    description: "Il tuo annuncio pubblicato su Immobiliare.it, Idealista, Casa.it e altri portali.",
    icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
  },
];

export default function WhyPrivatio() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-14 text-center">
            <h2 className="font-heading text-3xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-4xl">
              Perché scegliere Privatio
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#0B1D3A]/60 sm:text-lg">
              Tutto ciò che serve per vendere in tranquillità, senza commissioni.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.1}>
              <div className="group rounded-2xl border border-[#C9A84C]/10 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#C9A84C]/10">
                  <svg className="h-5 w-5 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                </div>
                <h3 className="mb-2 font-heading text-base font-normal text-[#0B1D3A]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#0B1D3A]/60">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
