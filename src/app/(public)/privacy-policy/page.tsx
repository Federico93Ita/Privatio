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

            {/* 1. TITOLARE */}
            <h2 className="text-lg font-medium text-text mt-0">1. Titolare del trattamento</h2>
            <p className="text-text-muted">
              Il Titolare del trattamento dei dati personali &egrave; Privatio S.r.l., con sede legale in Torino
              (di seguito &ldquo;il Titolare&rdquo;).
            </p>
            <p className="text-text-muted mt-2">
              Per qualsiasi richiesta relativa al trattamento dei dati personali: <strong>privacy@privatio.it</strong>
            </p>

            {/* 2. DATI TRATTATI */}
            <h2 className="text-lg font-medium text-text mt-8">2. Dati personali trattati</h2>
            <p className="text-text-muted">Il Titolare tratta le seguenti categorie di dati personali del Venditore:</p>

            <h3 className="text-base font-medium text-text mt-4 mb-2">Dati identificativi e di contatto:</h3>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>nome e cognome;</li>
              <li>indirizzo e-mail;</li>
              <li>numero di telefono (se fornito volontariamente).</li>
            </ul>

            <h3 className="text-base font-medium text-text mt-4 mb-2">Dati relativi all&apos;immobile:</h3>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>indirizzo dell&apos;immobile;</li>
              <li>caratteristiche dell&apos;immobile (metratura, numero di stanze, stato, etc.);</li>
              <li>prezzo indicativo di vendita;</li>
              <li>fotografie e planimetrie (se caricate).</li>
            </ul>

            <h3 className="text-base font-medium text-text mt-4 mb-2">Dati tecnici di navigazione:</h3>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>indirizzo IP;</li>
              <li>data e ora di accesso e di accettazione dei Termini;</li>
              <li>tipo di browser e dispositivo utilizzato.</li>
            </ul>

            {/* 3. FINALITÀ */}
            <h2 className="text-lg font-medium text-text mt-8">3. Finalit&agrave; e base giuridica del trattamento</h2>
            <p className="text-text-muted">I dati personali sono trattati per le seguenti finalit&agrave;:</p>
            <ul className="text-text-muted list-disc pl-6 space-y-3 mt-2">
              <li>
                <strong>Esecuzione del contratto</strong> (Art. 6, par. 1, lett. b, GDPR): gestione dell&apos;account,
                pubblicazione dell&apos;immobile, visualizzazione delle agenzie convenzionate nella zona, gestione del
                contatto diretto con le agenzie e, decorso il termine di 48 ore senza contatto, trasmissione dei dati
                alle agenzie convenzionate nella zona di riferimento;
              </li>
              <li>
                <strong>Adempimento di obblighi di legge</strong> (Art. 6, par. 1, lett. c, GDPR): conservazione dei dati
                per obblighi fiscali, contabili e normativi;
              </li>
              <li>
                <strong>Legittimo interesse del Titolare</strong> (Art. 6, par. 1, lett. f, GDPR): miglioramento del servizio,
                prevenzione di frodi e abusi, statistiche aggregate anonimizzate;
              </li>
              <li>
                <strong>Consenso dell&apos;interessato</strong> (Art. 6, par. 1, lett. a, GDPR): eventuale invio di comunicazioni
                promozionali, solo previa specifica e separata autorizzazione del Venditore.
              </li>
            </ul>

            {/* 4. DESTINATARI */}
            <h2 className="text-lg font-medium text-text mt-8">4. Destinatari dei dati</h2>
            <p className="text-text-muted">
              I dati personali del Venditore e le informazioni sull&apos;immobile saranno comunicati secondo le seguenti modalit&agrave;:
            </p>
            <ul className="text-text-muted list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Su iniziativa del Venditore:</strong> quando il Venditore contatta direttamente un&apos;agenzia
                convenzionata tramite la Piattaforma, i suoi dati di contatto sono trasmessi solo a tale agenzia;
              </li>
              <li>
                <strong>Automaticamente dopo 48 ore:</strong> qualora il Venditore non contatti alcuna agenzia entro 48 ore
                dalla pubblicazione, i dati sono trasmessi alle agenzie convenzionate nella zona geografica dell&apos;immobile,
                vincolate da appositi obblighi contrattuali di riservatezza;
              </li>
              <li>
                <strong>Fornitori di servizi tecnici</strong> (hosting, manutenzione, assistenza IT) che operano come Responsabili
                del trattamento ai sensi dell&apos;Art. 28 GDPR;
              </li>
              <li>
                <strong>Autorit&agrave; competenti</strong>, ove richiesto dalla legge.
              </li>
            </ul>
            <p className="text-text-muted mt-3">
              I dati <strong>NON</strong> saranno ceduti a terzi per finalit&agrave; di marketing n&eacute; diffusi pubblicamente.
            </p>

            {/* 5. CONSERVAZIONE */}
            <h2 className="text-lg font-medium text-text mt-8">5. Conservazione dei dati</h2>
            <p className="text-text-muted">
              I dati personali del Venditore saranno conservati per il tempo strettamente necessario al perseguimento delle finalit&agrave;
              sopra indicate, e comunque:
            </p>
            <ul className="text-text-muted list-disc pl-6 space-y-1 mt-2">
              <li>per tutta la durata del rapporto contrattuale;</li>
              <li>per 30 giorni successivi alla rimozione dell&apos;immobile (per finalit&agrave; tecniche di cancellazione);</li>
              <li>per il periodo previsto dalla normativa fiscale e contabile (10 anni) limitatamente ai dati necessari a tali adempimenti;</li>
              <li>in caso di contenzioso, per tutta la durata del procedimento e per il periodo di prescrizione applicabile.</li>
            </ul>

            {/* 6. DIRITTI */}
            <h2 className="text-lg font-medium text-text mt-8">6. Diritti dell&apos;interessato</h2>
            <p className="text-text-muted">Il Venditore ha diritto di:</p>
            <ul className="text-text-muted list-disc pl-6 space-y-1 mt-2">
              <li>accedere ai propri dati personali (Art. 15 GDPR);</li>
              <li>ottenere la rettifica dei dati inesatti (Art. 16 GDPR);</li>
              <li>ottenere la cancellazione dei dati &mdash; &ldquo;diritto all&apos;oblio&rdquo; (Art. 17 GDPR);</li>
              <li>limitare il trattamento (Art. 18 GDPR);</li>
              <li>ricevere i propri dati in formato strutturato e leggibile da dispositivo automatico &mdash; portabilit&agrave; (Art. 20 GDPR);</li>
              <li>opporsi al trattamento (Art. 21 GDPR);</li>
              <li>revocare il consenso in qualsiasi momento, senza pregiudicare la liceit&agrave; del trattamento basato sul consenso prestato prima della revoca;</li>
              <li>proporre reclamo al Garante per la Protezione dei Dati Personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">www.garanteprivacy.it</a>).</li>
            </ul>
            <p className="text-text-muted mt-3">
              Per esercitare i propri diritti, il Venditore pu&ograve; scrivere a <strong>privacy@privatio.it</strong>.
            </p>

            {/* 7. TRASFERIMENTO */}
            <h2 className="text-lg font-medium text-text mt-8">7. Trasferimento dei dati</h2>
            <p className="text-text-muted">
              I dati personali sono trattati su server situati nell&apos;Unione Europea. In caso di eventuale trasferimento verso
              Paesi terzi, il Titolare adotter&agrave; le garanzie previste dal GDPR (Clausole Contrattuali Standard, decisioni
              di adeguatezza o altre garanzie appropriate).
            </p>

            {/* 8. SICUREZZA */}
            <h2 className="text-lg font-medium text-text mt-8">8. Misure di sicurezza</h2>
            <p className="text-text-muted">
              Il Titolare adotta misure tecniche e organizzative adeguate a garantire un livello di sicurezza appropriato al rischio,
              tra cui: cifratura dei dati in transito e a riposo, controllo degli accessi, backup periodici, monitoraggio delle intrusioni.
            </p>

            {/* 9. SUB-PROCESSORI */}
            <h2 className="text-lg font-medium text-text mt-8">9. Responsabili del trattamento (sub-processori)</h2>
            <p className="text-text-muted">
              Il Titolare si avvale dei seguenti fornitori tecnologici, nominati Responsabili del trattamento ai sensi dell&apos;Art. 28 GDPR:
            </p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border border-border rounded-lg">
                <thead>
                  <tr className="bg-bg-soft">
                    <th className="p-2 text-left border-b border-border">Fornitore</th>
                    <th className="p-2 text-left border-b border-border">Servizio</th>
                    <th className="p-2 text-left border-b border-border">Sede</th>
                    <th className="p-2 text-left border-b border-border">Trasferimento</th>
                  </tr>
                </thead>
                <tbody className="text-text-muted">
                  <tr><td className="p-2 border-b border-border">Supabase Inc.</td><td className="p-2 border-b border-border">Database e storage</td><td className="p-2 border-b border-border">USA</td><td className="p-2 border-b border-border">SCCs</td></tr>
                  <tr><td className="p-2 border-b border-border">Vercel Inc.</td><td className="p-2 border-b border-border">Hosting e CDN</td><td className="p-2 border-b border-border">USA</td><td className="p-2 border-b border-border">SCCs</td></tr>
                  <tr><td className="p-2 border-b border-border">Stripe Inc.</td><td className="p-2 border-b border-border">Pagamenti</td><td className="p-2 border-b border-border">USA</td><td className="p-2 border-b border-border">SCCs</td></tr>
                  <tr><td className="p-2 border-b border-border">Resend Inc.</td><td className="p-2 border-b border-border">Email transazionali</td><td className="p-2 border-b border-border">USA</td><td className="p-2 border-b border-border">SCCs</td></tr>
                  <tr><td className="p-2">Google LLC</td><td className="p-2">Analytics, Maps, OAuth</td><td className="p-2">USA</td><td className="p-2">SCCs</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-text-muted mt-2">
              L&apos;elenco completo con i link alle DPA di ciascun fornitore &egrave; disponibile alla pagina{" "}
              <a href="/responsabili-trattamento" className="text-primary hover:underline font-medium">Responsabili del Trattamento</a>.
            </p>

            {/* 10. DATA BREACH */}
            <h2 className="text-lg font-medium text-text mt-8">10. Procedura in caso di violazione dei dati (Data Breach)</h2>
            <p className="text-text-muted">
              In caso di violazione dei dati personali che presenti un rischio per i diritti e le libert&agrave; delle persone fisiche,
              il Titolare notificher&agrave; la violazione al Garante per la Protezione dei Dati Personali entro 72 ore dalla scoperta
              (Art. 33 GDPR). Qualora la violazione comporti un rischio elevato, il Titolare informer&agrave; anche gli interessati
              senza ingiustificato ritardo (Art. 34 GDPR).
            </p>
            <p className="text-text-muted mt-2">
              Per segnalare un incidente di sicurezza: <strong>privacy@privatio.it</strong>.
            </p>

            {/* 11. DPIA */}
            <h2 className="text-lg font-medium text-text mt-8">11. Valutazione d&apos;impatto (DPIA)</h2>
            <p className="text-text-muted">
              Il Titolare ha condotto una Valutazione d&apos;Impatto sulla Protezione dei Dati (Art. 35 GDPR) per il meccanismo
              di trasmissione automatica dei dati ai sensi della &ldquo;Fase 2&rdquo; (trasmissione automatica alle agenzie dopo 48 ore).
              La valutazione ha confermato l&apos;adeguatezza delle misure di sicurezza adottate e il rispetto del principio di minimizzazione.
            </p>

            {/* 12. REFERENTE PRIVACY */}
            <h2 className="text-lg font-medium text-text mt-8">12. Referente per la protezione dei dati</h2>
            <p className="text-text-muted">
              Per qualsiasi richiesta relativa al trattamento dei dati personali, &egrave; possibile contattare il Referente Privacy
              all&apos;indirizzo: <strong>privacy@privatio.it</strong>.
            </p>

            {/* 13. CONSERVAZIONE PER TIPOLOGIA */}
            <h2 className="text-lg font-medium text-text mt-8">13. Periodi di conservazione per tipologia di dato</h2>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border border-border rounded-lg">
                <thead>
                  <tr className="bg-bg-soft">
                    <th className="p-2 text-left border-b border-border">Tipologia</th>
                    <th className="p-2 text-left border-b border-border">Periodo</th>
                  </tr>
                </thead>
                <tbody className="text-text-muted">
                  <tr><td className="p-2 border-b border-border">Dati dell&apos;account</td><td className="p-2 border-b border-border">Durata del contratto + 30 giorni</td></tr>
                  <tr><td className="p-2 border-b border-border">Dati immobiliari</td><td className="p-2 border-b border-border">Durata pubblicazione + 30 giorni</td></tr>
                  <tr><td className="p-2 border-b border-border">Dati di fatturazione</td><td className="p-2 border-b border-border">10 anni (obblighi fiscali)</td></tr>
                  <tr><td className="p-2 border-b border-border">Dati di navigazione/log</td><td className="p-2 border-b border-border">12 mesi</td></tr>
                  <tr><td className="p-2 border-b border-border">Cookie analitici (GA4)</td><td className="p-2 border-b border-border">14 mesi (Google default)</td></tr>
                  <tr><td className="p-2 border-b border-border">Consensi prestati</td><td className="p-2 border-b border-border">5 anni dalla revoca/scadenza</td></tr>
                  <tr><td className="p-2">Reclami</td><td className="p-2">5 anni dalla chiusura</td></tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-text-muted mt-8 pt-4 border-t border-border">
              Ultimo aggiornamento: Marzo 2026 — Per informazioni: privacy@privatio.it
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
