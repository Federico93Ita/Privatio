import ScrollReveal from "@/components/ui/ScrollReveal";
import LeadForm from "@/components/forms/LeadForm";

const benefits = [
  { title: "Zero costi nascosti", desc: "Non paghi nulla. Mai." },
  { title: "Risposte in 24h", desc: "Ti ricontattiamo rapidamente per guidarti." },
  { title: "Agenzie nella tua zona", desc: "Collaboriamo con professionisti locali verificati." },
  { title: "Supporto completo", desc: "Ti seguiamo dalla pubblicazione al rogito." },
];

export default function LeadSection() {
  return (
    <section id="inizia" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-4xl">
              Inizia ora, è gratuito
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#0B1D3A]/60 sm:text-lg">
              Compila il form e ti ricontatteremo entro 24 ore. Nessun costo, nessun impegno.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-5 gap-10 items-start">
          <ScrollReveal className="md:col-span-2" delay={0.1}>
            <div className="space-y-5 md:pt-4">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-3">
                  <svg className="h-5 w-5 mt-0.5 shrink-0 text-[#C9A84C]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-[#0B1D3A]">{b.title}</p>
                    <p className="text-xs text-[#0B1D3A]/50 mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
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
