import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Per Acquirenti — Informazioni sulla commissione",
  description: "Scopri come funziona la commissione acquirente su Privatio. Trasparenza totale, commissioni ridotte al 2-2.5%.",
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
              Su Privatio gli immobili sono venduti con commissioni trasparenti e ridotte. Ecco cosa devi sapere.
            </p>

            <div className="space-y-8">
              <div className="bg-white rounded-xl p-6 border border-border">
                <h2 className="text-xl font-medium text-text mb-3">Come funziona la commissione?</h2>
                <p className="text-text-muted leading-relaxed">
                  Su Privatio, il venditore non paga alcuna commissione. La commissione viene pagata dall&apos;acquirente
                  ed è compresa tra il <strong>2% e il 2.5%</strong> del prezzo di vendita. Questo è significativamente
                  inferiore rispetto al mercato tradizionale, dove le commissioni totali possono arrivare al 6% (3% + 3%).
                </p>
              </div>

              <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                <h2 className="text-xl font-medium text-text mb-3">Quanto risparmi rispetto al tradizionale?</h2>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-text-muted mb-1">Agenzia tradizionale</p>
                    <p className="text-2xl font-medium text-error">3% acquirente</p>
                    <p className="text-xs text-text-muted">+ 3% venditore = 6% totale</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-success">
                    <p className="text-sm text-text-muted mb-1">Con Privatio</p>
                    <p className="text-2xl font-medium text-success">2 - 2.5% acquirente</p>
                    <p className="text-xs text-text-muted">0% venditore = max 2.5% totale</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-border">
                <h2 className="text-xl font-medium text-text mb-3">Come viene suddivisa la commissione?</h2>
                <ul className="space-y-3 text-text-muted">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span><strong>Agenzia partner:</strong> 1.5% - 2% — per la gestione completa della vendita</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span><strong>Privatio:</strong> 0.5% — per la piattaforma e il matchmaking</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6 border border-border">
                <h2 className="text-xl font-medium text-text mb-3">Quali vantaggi per l&apos;acquirente?</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Commissioni ridotte e trasparenti",
                    "Immobili verificati e documentati",
                    "Agenzia professionale dedicata",
                    "Nessun costo nascosto",
                    "Supporto nella trattativa",
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
