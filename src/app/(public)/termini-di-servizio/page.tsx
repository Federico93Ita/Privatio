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
      <main className="py-16 bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="font-heading text-3xl text-[#0a1f44] mb-8">TERMINI DI SERVIZIO</h1>
          <div className="bg-white rounded-xl p-8 border border-[#e2e8f0] prose prose-slate max-w-none">
            <p className="text-sm text-[#64748b]">Ultimo aggiornamento: Marzo 2026</p>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">1. Descrizione del servizio</h2>
            <p className="text-[#64748b]">
              Privatio è una piattaforma digitale che consente ai privati di vendere immobili senza pagare
              commissioni di agenzia. La piattaforma mette in contatto venditori privati con agenzie
              immobiliari partner che gestiscono il processo di vendita.
            </p>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">2. Modello commissionale</h2>
            <p className="text-[#64748b]">
              Il venditore non paga alcuna commissione a Privatio o alle agenzie partner.
              L&apos;acquirente paga una commissione compresa tra il 2% e il 2.5% del prezzo di vendita,
              suddivisa tra l&apos;agenzia partner (1.5%-2%) e Privatio (0.5%).
            </p>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">3. Obblighi del venditore</h2>
            <ul className="text-[#64748b] list-disc pl-6 space-y-1">
              <li>Fornire informazioni veritiere sull&apos;immobile</li>
              <li>Garantire la titolarità o il diritto di vendita dell&apos;immobile</li>
              <li>Collaborare con l&apos;agenzia assegnata per visite e documentazione</li>
              <li>Rispettare il contratto di esclusiva firmato</li>
            </ul>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">4. Contratto di esclusiva</h2>
            <p className="text-[#64748b]">
              Alla pubblicazione dell&apos;immobile, il venditore firma un contratto di esclusiva digitale
              (art. 1326 c.c.) con l&apos;agenzia partner assegnata, della durata standard di 90 giorni.
              La firma avviene tramite OTP via email (firma semplice).
            </p>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">5. Obblighi delle agenzie partner</h2>
            <ul className="text-[#64748b] list-disc pl-6 space-y-1">
              <li>Mantenere un abbonamento attivo sulla piattaforma</li>
              <li>Gestire professionalmente gli immobili assegnati</li>
              <li>Effettuare sopralluoghi, foto e pubblicazione annunci</li>
              <li>Comunicare regolarmente con il venditore</li>
            </ul>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">6. Limitazione di responsabilità</h2>
            <p className="text-[#64748b]">
              Privatio agisce come intermediario tecnologico e non è parte nelle trattative di compravendita.
              Privatio non garantisce la vendita dell&apos;immobile né i tempi di vendita.
            </p>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">7. Recesso</h2>
            <p className="text-[#64748b]">
              L&apos;utente può cancellare il proprio account in qualsiasi momento scrivendo a supporto@privatio.it.
              Il ritiro di un immobile è soggetto ai termini del contratto di esclusiva.
            </p>

            <h2 className="text-lg font-bold text-[#0a1f44] mt-6">8. Foro competente</h2>
            <p className="text-[#64748b]">
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
