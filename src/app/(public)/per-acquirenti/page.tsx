import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Per Acquirenti — Come funziona Privatio",
  description: "Scopri come trovare il tuo immobile ideale su Privatio. Immobili verificati, agenzie professionali e trasparenza totale.",
};

export default function PerAcquirentiPage() {
  return (
    <>
      <Header />
      <main>
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-light tracking-[-0.03em] sm:text-4xl text-primary-dark text-center mb-6">Per gli acquirenti</h1>
            <p className="text-xl text-text-muted text-center max-w-2xl mx-auto mb-12">
              Su Privatio trovi immobili gestiti da agenzie professionali selezionate. Ecco cosa devi sapere.
            </p>

            <div className="space-y-8">
              <div className="bg-white rounded-xl p-6 border border-border">
                <h2 className="text-xl font-medium text-text mb-3">Come funziona Privatio?</h2>
                <p className="text-text-muted leading-relaxed">
                  Privatio è una piattaforma di lead generation immobiliare. I venditori inseriscono il proprio immobile
                  e vengono messi in contatto con agenzie partner verificate nella loro zona. L&apos;agenzia si occupa di
                  tutto: valutazione, foto, pubblicazione e gestione delle visite con i potenziali acquirenti.
                </p>
              </div>

              <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                <h2 className="text-xl font-medium text-text mb-3">Come trovo un immobile?</h2>
                <p className="text-text-muted leading-relaxed mb-4">
                  Gli immobili presenti su Privatio sono gestiti da agenzie professionali selezionate.
                  Puoi cercare tra gli annunci disponibili e contattare direttamente l&apos;agenzia di riferimento
                  per organizzare una visita.
                </p>
                <p className="text-text-muted leading-relaxed">
                  L&apos;eventuale commissione per l&apos;acquirente viene concordata direttamente con l&apos;agenzia
                  che gestisce l&apos;immobile, in modo trasparente e senza intermediazioni aggiuntive da parte di Privatio.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-border">
                <h2 className="text-xl font-medium text-text mb-3">Quali vantaggi per l&apos;acquirente?</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Immobili verificati e documentati",
                    "Agenzie professionali selezionate",
                    "Supporto nella trattativa",
                    "Nessun costo nascosto",
                    "Trasparenza totale sulle condizioni",
                    "Documentazione completa e sicura",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link href="/cerca" className="inline-block px-8 py-4 bg-primary text-white rounded-xl text-lg font-semibold hover:bg-primary/85 transition-colors">
                Cerca il tuo immobile
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
