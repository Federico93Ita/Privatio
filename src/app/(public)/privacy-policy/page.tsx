import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy Policy | Privatio",
  description: "Informativa sulla privacy di Privatio ai sensi del GDPR (Regolamento UE 2016/679).",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="py-16 bg-bg-soft">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-light tracking-[-0.03em] text-primary-dark mb-2">Informativa sulla Privacy</h1>
          <p className="text-sm text-text-muted mb-8">Utente Venditore &mdash; ai sensi degli artt. 13 e 14 del Regolamento UE 2016/679 (GDPR)</p>
          <div className="bg-white rounded-xl p-8 border border-border prose prose-slate max-w-none text-[15px]">

            <h2 className="text-lg font-medium text-text mt-0">1. Titolare del trattamento</h2>
            <p className="text-text-muted">
              Il Titolare del trattamento dei dati personali &egrave; Privatio, con sede legale in Italia.
              Per qualsiasi richiesta: <strong>privacy@privatio.it</strong>
            </p>

            <h2 className="text-lg font-medium text-text mt-6">2. Dati personali trattati</h2>
            <p className="text-text-muted">Il Titolare tratta le seguenti categorie di dati:</p>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li><strong>Dati identificativi e di contatto:</strong> nome e cognome, email, telefono (se fornito)</li>
              <li><strong>Dati relativi all&apos;immobile:</strong> indirizzo, caratteristiche, prezzo indicativo, fotografie e planimetrie</li>
              <li><strong>Dati tecnici:</strong> indirizzo IP, data e ora di accesso e accettazione dei Termini, browser e dispositivo</li>
            </ul>

            <h2 className="text-lg font-medium text-text mt-6">3. Finalit&agrave; e base giuridica</h2>
            <ul className="text-text-muted list-disc pl-6 space-y-2">
              <li>
                <strong>Esecuzione del contratto</strong> (Art. 6.1.b GDPR): gestione account, pubblicazione immobile,
                visualizzazione agenzie, gestione contatto diretto e, decorso il termine di 48 ore, trasmissione dati
                alle agenzie della zona
              </li>
              <li>
                <strong>Obblighi di legge</strong> (Art. 6.1.c GDPR): conservazione per obblighi fiscali e contabili
              </li>
              <li>
                <strong>Legittimo interesse</strong> (Art. 6.1.f GDPR): miglioramento del servizio, prevenzione frodi,
                statistiche aggregate anonimizzate
              </li>
              <li>
                <strong>Consenso</strong> (Art. 6.1.a GDPR): eventuale invio di comunicazioni promozionali, solo previa
                specifica autorizzazione
              </li>
            </ul>

            <h2 className="text-lg font-medium text-text mt-6">4. Destinatari dei dati</h2>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>
                <strong>Su iniziativa del Venditore:</strong> quando contatta un&apos;agenzia tramite la Piattaforma,
                i dati sono trasmessi solo a tale agenzia
              </li>
              <li>
                <strong>Automaticamente dopo 48 ore:</strong> se il Venditore non contatta nessuna agenzia,
                i dati sono trasmessi alle agenzie della zona (vincolate da obblighi di riservatezza)
              </li>
              <li>Fornitori di servizi tecnici (hosting, assistenza IT) come Responsabili del trattamento (Art. 28 GDPR)</li>
              <li>Autorit&agrave; competenti, ove richiesto dalla legge</li>
            </ul>
            <p className="text-text-muted mt-2">
              I dati <strong>NON</strong> saranno ceduti a terzi per finalit&agrave; di marketing n&eacute; diffusi pubblicamente.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">5. Conservazione dei dati</h2>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>Per tutta la durata del rapporto contrattuale</li>
              <li>30 giorni dopo la rimozione dell&apos;immobile (per finalit&agrave; tecniche di cancellazione)</li>
              <li>Fino a 10 anni per obblighi fiscali e contabili (limitatamente ai dati necessari)</li>
              <li>Per la durata di eventuali contenziosi e relativi periodi di prescrizione</li>
            </ul>

            <h2 className="text-lg font-medium text-text mt-6">6. Diritti dell&apos;interessato</h2>
            <p className="text-text-muted">Il Venditore ha diritto di:</p>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>Accedere ai propri dati personali (Art. 15 GDPR)</li>
              <li>Ottenere la rettifica dei dati inesatti (Art. 16 GDPR)</li>
              <li>Ottenere la cancellazione dei dati &mdash; &ldquo;diritto all&apos;oblio&rdquo; (Art. 17 GDPR)</li>
              <li>Limitare il trattamento (Art. 18 GDPR)</li>
              <li>Ricevere i propri dati in formato strutturato &mdash; portabilit&agrave; (Art. 20 GDPR)</li>
              <li>Opporsi al trattamento (Art. 21 GDPR)</li>
              <li>Revocare il consenso in qualsiasi momento</li>
              <li>Proporre reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it)</li>
            </ul>
            <p className="text-text-muted mt-2">
              Per esercitare i propri diritti: <strong>privacy@privatio.it</strong>
            </p>

            <h2 className="text-lg font-medium text-text mt-6">7. Trasferimento dei dati</h2>
            <p className="text-text-muted">
              I dati sono trattati su server nell&apos;Unione Europea. In caso di eventuale trasferimento verso Paesi terzi,
              il Titolare adotter&agrave; le garanzie previste dal GDPR (Clausole Contrattuali Standard, decisioni di adeguatezza
              o altre garanzie appropriate).
            </p>

            <h2 className="text-lg font-medium text-text mt-6">8. Misure di sicurezza</h2>
            <p className="text-text-muted">
              Il Titolare adotta misure tecniche e organizzative adeguate: cifratura dei dati in transito e a riposo,
              controllo degli accessi, backup periodici, monitoraggio delle intrusioni.
            </p>

            <p className="text-sm text-text-muted mt-8 pt-4 border-t border-border">
              Per informazioni: privacy@privatio.it
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
