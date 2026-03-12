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
      <main className="bg-[#f8fafc] min-h-screen">
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="font-heading text-4xl md:text-5xl text-[#0a1f44] mb-4">CONTATTI</h1>
              <p className="text-lg text-[#64748b]">
                Hai domande? Siamo qui per aiutarti. Scrivici e ti risponderemo il prima possibile.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact info */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
                  <h3 className="font-semibold text-[#0a1f44] mb-4">Informazioni di contatto</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0e8ff1]/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#0e8ff1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-[#64748b]">Email</p>
                        <p className="font-medium text-[#1e293b]">info@privatio.it</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0e8ff1]/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#0e8ff1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-[#64748b]">Sede</p>
                        <p className="font-medium text-[#1e293b]">Italia</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
                  <h3 className="font-semibold text-[#0a1f44] mb-3">Sei un venditore?</h3>
                  <p className="text-[#64748b] text-sm mb-3">
                    Se vuoi vendere il tuo immobile senza pagare commissioni, inizia dal form di inserimento.
                  </p>
                  <a href="/vendi" className="text-[#0e8ff1] font-medium text-sm hover:underline">
                    Inserisci il tuo immobile &rarr;
                  </a>
                </div>

                <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
                  <h3 className="font-semibold text-[#0a1f44] mb-3">Sei un&apos;agenzia?</h3>
                  <p className="text-[#64748b] text-sm mb-3">
                    Scopri come entrare nel network Privatio e ricevere clienti venditori qualificati.
                  </p>
                  <a href="/agenzie" className="text-[#0e8ff1] font-medium text-sm hover:underline">
                    Diventa partner &rarr;
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
