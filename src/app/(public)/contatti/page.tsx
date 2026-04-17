import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contatti",
  description: "Contatta Privatio per informazioni sulla vendita del tuo immobile o sulla partnership con agenzie.",
};

export default function ContattiPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative mesh-navy pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden grain">
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8F6F1] to-transparent" />

          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <span className="eyebrow text-[#C9A84C]/80 animate-fade-in">Parliamo</span>
            <h1 className="mt-5 h-display text-white animate-slide-up">
              Come possiamo <span className="ink-gold">aiutarti?</span>
            </h1>
            <p
              className="mt-8 text-lg text-white/70 max-w-2xl mx-auto leading-relaxed md:text-xl animate-slide-up"
              style={{ animationDelay: "0.15s" }}
            >
              Scrivici a <a href="mailto:info@privatio.it" className="text-[#C9A84C] hover:text-[#D4B65E] underline underline-offset-4">info@privatio.it</a>.
              Rispondiamo in poche ore lavorative.
            </p>
          </div>
        </section>

        <section className="relative bg-[#F8F6F1] py-24 md:py-32">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact info */}
              <div className="space-y-5">
                <div className="rounded-3xl bg-white p-7 border border-[#C9A84C]/[0.08] shadow-sm">
                  <h3 className="font-heading text-lg font-normal text-[#0B1D3A] mb-5">Informazioni di contatto</h3>
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-[#C9A84C]/10 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-[#0B1D3A]/40 uppercase tracking-wide">Email</p>
                        <p className="font-medium text-[#0B1D3A]">info@privatio.it</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-[#C9A84C]/10 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-[#0B1D3A]/40 uppercase tracking-wide">Sede</p>
                        <p className="font-medium text-[#0B1D3A]">Italia</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group rounded-3xl bg-white p-7 border border-[#C9A84C]/[0.08] shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#C9A84C]/20">
                  <h3 className="font-heading text-lg font-normal text-[#0B1D3A] mb-2">Sei un venditore?</h3>
                  <p className="text-sm text-[#0B1D3A]/50 mb-4 leading-relaxed">
                    Se vuoi vendere il tuo immobile senza pagare commissioni, inizia dal form di inserimento.
                  </p>
                  <a href="/vendi" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#C9A84C] hover:text-[#B8943B] transition-colors group-hover:gap-2.5">
                    Inserisci il tuo immobile
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </div>

                <div className="group rounded-3xl bg-white p-7 border border-[#C9A84C]/[0.08] shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#C9A84C]/20">
                  <h3 className="font-heading text-lg font-normal text-[#0B1D3A] mb-2">Sei un&apos;agenzia?</h3>
                  <p className="text-sm text-[#0B1D3A]/50 mb-4 leading-relaxed">
                    Scopri come entrare nel network Privatio e ricevere clienti venditori qualificati.
                  </p>
                  <a href="/agenzie" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#C9A84C] hover:text-[#B8943B] transition-colors group-hover:gap-2.5">
                    Diventa partner
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Contact form */}
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
