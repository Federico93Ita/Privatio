import ScrollReveal from "@/components/ui/ScrollReveal";
import LeadForm from "@/components/forms/LeadForm";

const benefits = [
  { title: "Zero costi nascosti", desc: "Non paghi nulla. Mai. Nessuna sorpresa." },
  { title: "Risposte rapide", desc: "Ti ricontattiamo per guidarti nella registrazione del tuo immobile." },
  { title: "Agenzie nella tua zona", desc: "Collaboriamo con professionisti locali verificati e qualificati." },
  { title: "Supporto completo", desc: "Ti seguiamo dalla scelta dell'agenzia fino al rogito." },
];

export default function LeadSection() {
  return (
    <section id="inizia" className="relative bg-white py-24 md:py-32 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/15 to-transparent" />
      <div className="absolute left-[-5%] bottom-[10%] w-64 h-64 rounded-full bg-[#C9A84C]/[0.03] blur-[80px]" />
      <div className="absolute right-[-3%] top-[10%] w-48 h-48 rounded-full bg-[#0B1D3A]/[0.02] blur-[60px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C] mb-4">Inizia subito</span>
            <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-5xl">
              Inizia ora, è gratuito
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-[#0B1D3A]/50 sm:text-lg leading-relaxed">
              Compila il form e ti guideremo nel processo di vendita. Nessun costo, nessun impegno.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-5 gap-12 items-start">
          <ScrollReveal className="md:col-span-2" delay={0.1}>
            <div className="space-y-6 md:pt-6 md:sticky md:top-28">
              {benefits.map((b, i) => (
                <div key={b.title} className="group flex gap-4">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9A84C]/15 to-[#C9A84C]/5 transition-transform duration-300 group-hover:scale-110">
                    <svg className="h-5 w-5 text-[#C9A84C]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-medium text-[#0B1D3A]">{b.title}</p>
                    <p className="text-sm text-[#0B1D3A]/45 mt-1 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}

              {/* Trust indicator */}
              <div className="mt-8 rounded-2xl border border-[#C9A84C]/10 bg-[#F8F6F1] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="h-5 w-5 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <p className="text-sm font-medium text-[#0B1D3A]">Dati protetti e sicuri</p>
                </div>
                <p className="text-xs text-[#0B1D3A]/40 leading-relaxed">
                  I tuoi dati sono trattati nel rispetto del GDPR. Non li condividiamo con terzi senza il tuo consenso.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal className="md:col-span-3" delay={0.2}>
            <LeadForm />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
