import ScrollReveal from "@/components/ui/ScrollReveal";
import { formatPrice } from "@/lib/utils";

const testimonials = [
  {
    quote: "Ho venduto il mio trilocale in zona Navigli in meno di 2 mesi. L'agenzia si è occupata di tutto, dalle visite al rogito. E non ho pagato un euro di provvigione.",
    author: "Marco R.",
    location: "Milano",
    detail: "Trilocale — venduto in 52 giorni",
    date: "Febbraio 2026",
    savings: 11400,
    stars: 5,
    initials: "MR",
  },
  {
    quote: "Ero scettica all'inizio, ma il servizio è davvero trasparente. L'agenzia partner mi ha seguito passo passo e ho incassato l'intero prezzo di vendita.",
    author: "Giulia P.",
    location: "Roma",
    detail: "Bilocale — venduto in 38 giorni",
    date: "Gennaio 2026",
    savings: 9800,
    stars: 5,
    initials: "GP",
  },
  {
    quote: "Villa con giardino, venduta al prezzo che volevo. L'agenzia locale conosceva perfettamente il mercato della zona e ha gestito le visite in modo impeccabile.",
    author: "Andrea B.",
    location: "Torino",
    detail: "Villa bifamiliare — venduta in 67 giorni",
    date: "Marzo 2026",
    savings: 15600,
    stars: 5,
    initials: "AB",
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
            <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C]/70 mb-4">Testimonianze</span>
            <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-white sm:text-5xl">
              Chi ha venduto con Privatio
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/40 sm:text-lg leading-relaxed">
              Leggi le esperienze di chi ha già venduto casa senza commissioni.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <ScrollReveal key={testimonial.author} delay={i * 0.15}>
              <div className="group relative flex flex-col justify-between rounded-3xl border border-white/[0.06] bg-white/[0.03] p-8 transition-all duration-500 hover:bg-white/[0.07] hover:border-white/[0.12] overflow-hidden md:p-9">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                <div className="relative">
                  {/* Stars + quote mark */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.stars }).map((_, j) => (
                        <svg key={j} className="h-4 w-4 text-[#C9A84C]" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-5xl font-heading text-[#C9A84C]/[0.08] leading-none select-none">&ldquo;</span>
                  </div>

                  <blockquote className="text-base leading-relaxed text-white/70">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                </div>

                {/* Detail line */}
                <p className="mt-4 text-xs text-[#C9A84C]/50 font-medium tracking-wide">
                  {testimonial.detail}
                </p>

                {/* Author row */}
                <div className="relative mt-6 flex items-center justify-between border-t border-white/[0.06] pt-6">
                  <div className="flex items-center gap-3">
                    {/* Avatar with initials */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C]/20 to-[#C9A84C]/10 text-sm font-semibold text-[#C9A84C]">
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{testimonial.author}</p>
                      <p className="text-xs text-white/30">{testimonial.location} · {testimonial.date}</p>
                    </div>
                  </div>
                  <div className="rounded-full bg-[#C9A84C]/[0.08] px-3.5 py-1.5 flex items-center gap-1.5 border border-[#C9A84C]/10">
                    <svg className="h-3 w-3 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <p className="text-xs font-bold text-[#C9A84C]">{formatPrice(testimonial.savings)}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Social proof summary */}
        <ScrollReveal delay={0.5}>
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-6 py-3 backdrop-blur-sm">
              <div className="flex -space-x-2">
                {["MR", "GP", "AB"].map((initials, i) => (
                  <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C]/30 to-[#C9A84C]/15 text-[10px] font-bold text-[#C9A84C] border-2 border-[#0B1D3A]">
                    {initials}
                  </div>
                ))}
              </div>
              <div className="h-4 w-px bg-white/10" />
              <p className="text-sm text-white/40">
                Venditori soddisfatti <span className="text-white/70 font-semibold">in tutta Italia</span>
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
