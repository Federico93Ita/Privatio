import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Cookie Policy | Privatio",
  description: "Informativa sull'utilizzo dei cookie su Privatio.",
};

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <main className="py-16 bg-bg-soft">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-light tracking-[-0.03em] text-primary-dark mb-8">Cookie Policy</h1>
          <div className="bg-white rounded-xl p-8 border border-border prose prose-slate max-w-none">
            <p className="text-sm text-text-muted">Ultimo aggiornamento: Marzo 2026</p>

            <h2 className="text-lg font-medium text-text mt-6">1. Cosa sono i cookie</h2>
            <p className="text-text-muted">
              I cookie sono piccoli file di testo che vengono memorizzati sul dispositivo dell&apos;utente
              durante la navigazione sul sito web. La presente policy &egrave; conforme al Regolamento UE 2016/679 (GDPR)
              e alla Direttiva ePrivacy 2002/58/CE, come recepita dal D.Lgs. 196/2003 e successive modifiche.
            </p>
            <p className="text-text-muted mt-2">
              La presente Cookie Policy si applica a tutti gli utenti della Piattaforma, inclusi gli utenti
              acquirenti (disciplinati dai{" "}
              <a href="/termini-servizio-acquirente" className="text-primary hover:underline">
                Termini di Servizio Acquirente
              </a>
              ) e i venditori (disciplinati dai{" "}
              <a href="/termini-di-servizio" className="text-primary hover:underline">
                Termini di Servizio Venditore
              </a>
              ).
            </p>

            <h2 className="text-lg font-medium text-text mt-6">2. Titolare del trattamento</h2>
            <p className="text-text-muted">
              Il Titolare del trattamento dei dati raccolti tramite cookie &egrave; Privatio S.r.l., con sede
              legale in Torino. Per qualsiasi richiesta relativa ai cookie: <strong>privacy@privatio.it</strong>.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">3. Categorie di cookie utilizzati</h2>

            <h3 className="text-base font-medium text-primary-dark mt-4">3.1. Cookie tecnici (necessari)</h3>
            <p className="text-text-muted">
              Essenziali per il funzionamento del sito. Non richiedono consenso (Art. 122, co. 1, D.Lgs. 196/2003).
            </p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border border-border rounded-lg">
                <thead>
                  <tr className="bg-bg-soft">
                    <th className="p-2 text-left border-b border-border">Nome</th>
                    <th className="p-2 text-left border-b border-border">Fornitore</th>
                    <th className="p-2 text-left border-b border-border">Finalit&agrave;</th>
                    <th className="p-2 text-left border-b border-border">Durata</th>
                  </tr>
                </thead>
                <tbody className="text-text-muted">
                  <tr>
                    <td className="p-2 border-b border-border">next-auth.session-token</td>
                    <td className="p-2 border-b border-border">Privatio</td>
                    <td className="p-2 border-b border-border">Sessione utente autenticato</td>
                    <td className="p-2 border-b border-border">7 giorni</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b border-border">next-auth.csrf-token</td>
                    <td className="p-2 border-b border-border">Privatio</td>
                    <td className="p-2 border-b border-border">Protezione CSRF</td>
                    <td className="p-2 border-b border-border">Sessione</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b border-border">next-auth.callback-url</td>
                    <td className="p-2 border-b border-border">Privatio</td>
                    <td className="p-2 border-b border-border">URL di ritorno dopo login</td>
                    <td className="p-2 border-b border-border">Sessione</td>
                  </tr>
                  <tr>
                    <td className="p-2">privatio-cookie-consent</td>
                    <td className="p-2">Privatio</td>
                    <td className="p-2">Registrazione preferenze cookie (localStorage)</td>
                    <td className="p-2">Persistente</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-base font-medium text-primary-dark mt-6">3.2. Cookie funzionali (servizi terzi)</h3>
            <p className="text-text-muted">
              Necessari per il funzionamento di servizi integrati nella Piattaforma. Installati quando
              l&apos;utente accede a pagine che utilizzano tali servizi.
            </p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border border-border rounded-lg">
                <thead>
                  <tr className="bg-bg-soft">
                    <th className="p-2 text-left border-b border-border">Nome</th>
                    <th className="p-2 text-left border-b border-border">Fornitore</th>
                    <th className="p-2 text-left border-b border-border">Finalit&agrave;</th>
                    <th className="p-2 text-left border-b border-border">Durata</th>
                  </tr>
                </thead>
                <tbody className="text-text-muted">
                  <tr>
                    <td className="p-2 border-b border-border">NID, CONSENT, 1P_JAR</td>
                    <td className="p-2 border-b border-border">Google LLC</td>
                    <td className="p-2 border-b border-border">Google Maps: visualizzazione mappe immobili e zone agenzie</td>
                    <td className="p-2 border-b border-border">6 mesi</td>
                  </tr>
                  <tr>
                    <td className="p-2">__stripe_mid, __stripe_sid</td>
                    <td className="p-2">Stripe Inc.</td>
                    <td className="p-2">Elaborazione pagamenti sicuri (area agenzie)</td>
                    <td className="p-2">1 anno / Sessione</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-base font-medium text-primary-dark mt-6">3.3. Cookie analitici (previo consenso)</h3>
            <p className="text-text-muted">
              Utilizziamo Google Analytics 4 per analizzare il traffico del sito in forma aggregata e anonimizzata (IP anonymization attivo).
              Questi cookie vengono installati <strong>solo dopo il consenso esplicito</strong> dell&apos;utente.
            </p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border border-border rounded-lg">
                <thead>
                  <tr className="bg-bg-soft">
                    <th className="p-2 text-left border-b border-border">Nome</th>
                    <th className="p-2 text-left border-b border-border">Fornitore</th>
                    <th className="p-2 text-left border-b border-border">Finalit&agrave;</th>
                    <th className="p-2 text-left border-b border-border">Durata</th>
                  </tr>
                </thead>
                <tbody className="text-text-muted">
                  <tr>
                    <td className="p-2 border-b border-border">_ga</td>
                    <td className="p-2 border-b border-border">Google LLC</td>
                    <td className="p-2 border-b border-border">Distinzione utenti unici</td>
                    <td className="p-2 border-b border-border">2 anni</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b border-border">_ga_*</td>
                    <td className="p-2 border-b border-border">Google LLC</td>
                    <td className="p-2 border-b border-border">Mantenimento stato sessione GA4</td>
                    <td className="p-2 border-b border-border">2 anni</td>
                  </tr>
                  <tr>
                    <td className="p-2">_gid</td>
                    <td className="p-2">Google LLC</td>
                    <td className="p-2">Distinzione utenti (24h)</td>
                    <td className="p-2">24 ore</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-text-muted mt-2">
              <strong>Periodo di conservazione dati in Google Analytics:</strong> 14 mesi (impostazione predefinita GA4).
              Per la DPA di Google Analytics:{" "}
              <a href="https://business.safety.google/processorterms/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Google Data Processing Terms
              </a>.
            </p>

            <h3 className="text-base font-medium text-primary-dark mt-6">3.4. Cookie di marketing</h3>
            <p className="text-text-muted">
              Al momento non utilizziamo cookie di marketing o profilazione.
              In futuro, eventuali cookie di marketing verranno attivati solo con il consenso esplicito dell&apos;utente
              tramite il pannello di gestione cookie, e questa policy verr&agrave; aggiornata di conseguenza.
            </p>

            <h2 className="text-lg font-medium text-text mt-8">4. Gestione dei cookie e consenso granulare</h2>
            <p className="text-text-muted">
              Al primo accesso al sito, viene mostrato un banner con tre opzioni:
            </p>
            <ul className="list-disc ml-5 text-text-muted space-y-1 mt-2">
              <li><strong>Accetta tutti</strong>: attiva cookie tecnici + analitici + marketing</li>
              <li><strong>Personalizza</strong>: consente di scegliere singolarmente le categorie (analitici on/off, marketing on/off)</li>
              <li><strong>Rifiuta tutti</strong>: attiva solo i cookie tecnici necessari</li>
            </ul>
            <p className="text-text-muted mt-2">
              L&apos;utente pu&ograve; modificare le proprie preferenze in qualsiasi momento cliccando
              su &ldquo;Gestisci cookie&rdquo; nel footer del sito. La revoca del consenso non pregiudica
              la liceit&agrave; del trattamento basato sul consenso prima della revoca (Art. 7, co. 3 GDPR).
            </p>
            <p className="text-text-muted mt-2">
              Il consenso viene registrato localmente con le seguenti informazioni: categorie accettate/rifiutate,
              timestamp, versione della Cookie Policy. Nessun dato viene inviato a server esterni al momento
              della registrazione del consenso.
            </p>

            <h2 className="text-lg font-medium text-text mt-8">5. Disattivazione tramite browser</h2>
            <p className="text-text-muted">
              Oltre al banner di consenso, l&apos;utente pu&ograve; gestire i cookie direttamente dalle
              impostazioni del proprio browser:
            </p>
            <ul className="list-disc ml-5 text-text-muted space-y-1 mt-2">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Google Chrome
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Safari
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Microsoft Edge
                </a>
              </li>
            </ul>
            <p className="text-text-muted mt-2">
              La disattivazione dei cookie tecnici potrebbe compromettere il funzionamento del sito.
            </p>

            <h2 className="text-lg font-medium text-text mt-8">6. Base giuridica</h2>
            <p className="text-text-muted">
              Cookie tecnici: legittimo interesse e necessit&agrave; contrattuale (Art. 6(1)(b) e (f) GDPR;
              Art. 122, co. 1, D.Lgs. 196/2003).
            </p>
            <p className="text-text-muted mt-1">
              Cookie funzionali di terze parti: legittimo interesse per l&apos;erogazione del servizio richiesto
              dall&apos;utente (visualizzazione mappe, pagamenti).
            </p>
            <p className="text-text-muted mt-1">
              Cookie analitici e di marketing: consenso esplicito (Art. 6(1)(a) GDPR), raccolto tramite il banner cookie.
            </p>

            <h2 className="text-lg font-medium text-text mt-8">7. Trasferimento dati extra-UE</h2>
            <p className="text-text-muted">
              I cookie di Google (Analytics e Maps) e Stripe possono comportare il trasferimento di dati
              verso gli Stati Uniti. Tali trasferimenti avvengono sulla base del{" "}
              <em>EU-US Data Privacy Framework</em> (decisione di adeguatezza della Commissione Europea
              del 10 luglio 2023) e delle Standard Contractual Clauses (SCC) adottate dai fornitori.
            </p>

            <h2 className="text-lg font-medium text-text mt-8">8. Diritti dell&apos;utente</h2>
            <p className="text-text-muted">
              Ai sensi degli artt. 15-22 del GDPR, l&apos;utente ha diritto di:
            </p>
            <ul className="list-disc ml-5 text-text-muted space-y-1 mt-2">
              <li>accedere ai propri dati personali;</li>
              <li>rettificare dati inesatti;</li>
              <li>ottenere la cancellazione dei dati (&ldquo;diritto all&apos;oblio&rdquo;);</li>
              <li>limitare il trattamento;</li>
              <li>opporsi al trattamento basato su legittimo interesse;</li>
              <li>revocare il consenso in qualsiasi momento;</li>
              <li>
                proporre reclamo al Garante per la protezione dei dati personali (
                <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  www.garanteprivacy.it
                </a>
                ).
              </li>
            </ul>

            <h2 className="text-lg font-medium text-text mt-8">9. Contatti</h2>
            <p className="text-text-muted">
              Per informazioni sulla gestione dei cookie o per esercitare i propri diritti:{" "}
              <strong>privacy@privatio.it</strong>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
