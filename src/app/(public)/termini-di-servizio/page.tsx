import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Termini di Servizio",
  description: "Termini e condizioni d'uso della piattaforma Privatio.",
};

export default function TerminiPage() {
  return (
    <>
      <Header />
      <main className="py-16 bg-bg-soft">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-light tracking-[-0.03em] text-primary-dark mb-8">Termini di Servizio</h1>
          <div className="bg-white rounded-xl p-8 border border-border prose prose-slate max-w-none">
            <p className="text-sm text-text-muted">Ultimo aggiornamento: Marzo 2026</p>

            <h2 className="text-lg font-medium text-text mt-6">1. Descrizione del servizio</h2>
            <p className="text-text-muted">
              Privatio è una piattaforma tecnologica di lead generation che fornisce alle agenzie
              immobiliari segnalazioni di potenziali clienti venditori. Privatio non svolge attività
              di mediazione immobiliare ai sensi della Legge 39/1989 e non è parte di alcun rapporto
              contrattuale tra venditore e agenzia. Il venditore, dopo aver inserito il proprio immobile,
              può consultare la lista delle agenzie partner nella propria zona e contattare direttamente
              l&apos;agenzia prescelta. Qualora il venditore non contatti alcuna agenzia entro 48 ore
              dall&apos;inserimento dell&apos;immobile, i dati dell&apos;immobile e del venditore vengono
              automaticamente condivisi con le agenzie partner attive nella zona di riferimento.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">2. Modello economico</h2>
            <p className="text-text-muted">
              Privatio si sostiene tramite abbonamenti territoriali sottoscritti dalle agenzie partner.
              Il venditore non paga alcun costo a Privatio. L&apos;eventuale provvigione tra agenzia
              e cliente è un rapporto diretto tra le parti, in cui Privatio non interviene.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">3. Obblighi del venditore</h2>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>Fornire informazioni veritiere sull&apos;immobile</li>
              <li>Garantire la titolarità o il diritto di vendita dell&apos;immobile</li>
              <li>Collaborare in buona fede con l&apos;agenzia contattata</li>
            </ul>

            <h2 className="text-lg font-medium text-text mt-6">4. Natura del servizio</h2>
            <p className="text-text-muted">
              Privatio fornisce un servizio tecnologico di segnalazione lead. Eventuali accordi,
              incarichi o contratti tra venditore e agenzia sono stipulati direttamente tra le parti,
              senza il coinvolgimento di Privatio. L&apos;autorizzazione al contatto firmata dal
              venditore consente la condivisione dei dati con l&apos;agenzia partner scelta dal venditore o, trascorse 48 ore, con le agenzie partner attive nella zona.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">5. Obblighi delle agenzie partner</h2>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>Mantenere un abbonamento attivo sulla piattaforma</li>
              <li>Gestire professionalmente i lead ricevuti</li>
              <li>Gestire in modo tempestivo i contatti ricevuti dai venditori e le segnalazioni automatiche</li>
              <li>Comunicare regolarmente con il venditore</li>
            </ul>

            <h2 className="text-lg font-medium text-text mt-6">6. Limitazione di responsabilità</h2>
            <p className="text-text-muted">
              Privatio è una piattaforma tecnologica e non svolge attività di mediazione immobiliare.
              Non è parte nelle trattative di compravendita né in alcun rapporto contrattuale tra
              venditore e agenzia. Privatio non garantisce la vendita dell&apos;immobile né i tempi di vendita.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">7. Recesso</h2>
            <p className="text-text-muted">
              L&apos;utente può cancellare il proprio account e ritirare il proprio immobile
              in qualsiasi momento scrivendo a supporto@privatio.it.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">8. Foro competente</h2>
            <p className="text-text-muted">
              Per qualsiasi controversia sarà competente il Foro del luogo di residenza del consumatore,
              ai sensi del D.Lgs. 206/2005 (Codice del Consumo).
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
