import ScrollReveal from "@/components/ui/ScrollReveal";
import { formatPrice } from "@/lib/utils";

const testimonials = [
  {
    quote: "Ho venduto il mio appartamento a Milano senza pagare un centesimo di commissione. Incredibile.",
    author: "Marco R.",
    location: "Milano",
    savings: 12000,
    stars: 5,
  },
  {
    quote: "Servizio professionale e trasparente. L'agenzia partner è stata impeccabile.",
    author: "Giulia P.",
    location: "Roma",
    savings: 10000,
    stars: 5,
  },
  {
    quote: "Finalmente una piattaforma dalla parte del venditore. La consiglio a tutti.",
    author: "Andrea B.",
    location: "Torino",
    savings: 16000,
    stars: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-[#0B1D3A] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-14 text-center">
            <h2 className="font-heading text-3xl font-normal tracking-[-0.02em] text-white sm:text-4xl">
              Chi ha venduto con Privatio
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/50 sm:text-lg">
              Leggi le esperienze di chi ha già venduto casa senza commissioni.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <ScrollReveal key={testimonial.author} delay={i * 0.15}>
              <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-all duration-300 hover:bg-white/10 md:p-8">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {Array.from({ length: testimonial.stars }).map((_, j) => (
                        <svg key={j} className="h-5 w-5 text-[#C9A84C]" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-4xl font-serif text-[#C9A84C]/20 leading-none">&ldquo;</span>
                  </div>
                  <blockquote className="text-base leading-relaxed text-white/80">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{testimonial.author}</p>
                    <p className="text-xs text-white/40">{testimonial.location}</p>
                  </div>
                  <div className="rounded-full bg-[#C9A84C]/10 px-4 py-1.5 flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <p className="text-xs font-bold text-[#C9A84C]">{formatPrice(testimonial.savings)}</p>
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
