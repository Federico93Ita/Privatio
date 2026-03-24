"use client";

import { useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Accordion component                                                */
/* ------------------------------------------------------------------ */

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 px-1 text-left hover:bg-bg-soft/50 transition-colors"
      >
        <span className="font-medium text-text">{title}</span>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="pb-5 px-1 text-sm text-text-muted leading-relaxed space-y-3">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ContrattoAgenziaPage() {
  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Header */}
      <div className="bg-primary-dark text-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/" className="text-white/60 hover:text-white text-sm mb-4 inline-block">
            &larr; Torna alla home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Contratto di Convenzionamento</h1>
          <p className="text-white/70 mt-2">Agenzia Immobiliare &mdash; Versione 1.0 &mdash; Marzo 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* In breve */}
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-primary-dark mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            In breve
          </h2>
          <ul className="space-y-2 text-sm text-text">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">&#10003;</span>
              <span>Privatio fornisce un servizio tecnologico di vetrina digitale, <strong>non</strong> &egrave; un&rsquo;agenzia immobiliare</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">&#10003;</span>
              <span>L&rsquo;agenzia convenzionata <strong>non pu&ograve; richiedere provvigioni ai venditori</strong> contattati tramite Privatio (Art. 5-bis)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">&#10003;</span>
              <span>Abbonamento mensile con rinnovo automatico, recesso libero in qualsiasi momento</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">&#10003;</span>
              <span>I dati dei venditori (Lead) sono riservati e soggetti a GDPR &mdash; cancellazione entro 90 giorni se non si instaura un rapporto</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">&#10003;</span>
              <span>Ogni zona ha un numero massimo di agenzie (slot) per garantire qualit&agrave; del servizio</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">&#10003;</span>
              <span>Richiesta iscrizione al Registro Agenti di Affari in Mediazione (L. 39/1989) e polizza RC professionale</span>
            </li>
          </ul>
        </div>

        {/* Full contract */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          {/* Premesse */}
          <Section title="Premesse" defaultOpen>
            <p>
              Il presente contratto (di seguito &ldquo;il Contratto&rdquo;) disciplina i termini e le condizioni di
              convenzionamento tra la piattaforma Privatio e l&rsquo;agenzia immobiliare che intende aderire al servizio
              in qualit&agrave; di agenzia convenzionata (di seguito &ldquo;l&rsquo;Agenzia&rdquo;).
            </p>
            <p>
{/* TODO: Inserire dati reali quando la società sarà costituita */}
              La Piattaforma &egrave; gestita da Privatio S.r.l., con sede legale in Torino,
              iscritta al Registro delle Imprese di Torino (di seguito &ldquo;Privatio&rdquo; o &ldquo;il Fornitore&rdquo;).
              I dati societari completi (C.F./P.IVA, numero REA) saranno indicati a seguito della costituzione della societ&agrave;.
            </p>
            <p>
              L&rsquo;Agenzia dichiara di essere regolarmente iscritta al Registro degli Agenti di Affari in Mediazione
              presso la competente Camera di Commercio ai sensi della Legge 3 febbraio 1989, n. 39, e di essere in possesso
              di tutti i requisiti previsti dalla normativa vigente per l&rsquo;esercizio dell&rsquo;attivit&agrave; di mediazione immobiliare.
            </p>
            <p>
              L&rsquo;accettazione del presente Contratto avviene in forma digitale al momento del completamento della
              procedura di registrazione sulla Piattaforma, a seguito dell&rsquo;approvazione della candidatura da parte
              di Privatio. L&rsquo;accettazione &egrave; tracciata e registrata con le seguenti informazioni: indirizzo IP,
              data e ora (timestamp), indirizzo e-mail verificato dell&rsquo;Agenzia.
            </p>
          </Section>

          {/* Art. 1 */}
          <Section title="Art. 1 – Oggetto del Contratto">
            <p>
              <strong>1.1.</strong> Il presente Contratto ha per oggetto la fornitura da parte di Privatio all&rsquo;Agenzia
              di un servizio tecnologico di connessione con utenti venditori (di seguito &ldquo;Lead&rdquo;) che hanno pubblicato
              i propri immobili sulla Piattaforma, secondo le modalit&agrave; e i livelli di servizio definiti nel piano di
              abbonamento prescelto.
            </p>
            <p>
              <strong>1.2.</strong> Privatio NON &egrave; un&rsquo;agenzia immobiliare e non svolge attivit&agrave; di mediazione
              immobiliare ai sensi dell&rsquo;art. 1754 del Codice Civile e della Legge 3 febbraio 1989, n. 39. Privatio
              opera esclusivamente come fornitore di un servizio tecnologico di vetrina digitale. Non partecipa alle trattative,
              non determina le condizioni delle compravendite, non percepisce provvigioni sulle vendite e non ha alcun rapporto
              giuridico con gli acquirenti degli immobili.
            </p>
            <p>
              <strong>1.3.</strong> Privatio non garantisce in alcun modo la conclusione di compravendite, la qualit&agrave;
              dei Lead, la veridicit&agrave; delle informazioni fornite dai venditori o il raggiungimento di obiettivi commerciali
              da parte dell&rsquo;Agenzia.
            </p>
          </Section>

          {/* Art. 2 */}
          <Section title="Art. 2 – Procedura di Convenzionamento">
            <p><strong>2.1.</strong> L&rsquo;adesione al servizio avviene attraverso la seguente procedura:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>L&rsquo;Agenzia presenta la propria candidatura compilando il modulo di richiesta sulla Piattaforma, indicando i dati identificativi, le zone di interesse e il piano di abbonamento preferito;</li>
              <li>Privatio valuta la candidatura in base a criteri di idoneit&agrave; e si riserva il diritto insindacabile di accettare o rifiutare la candidatura senza obbligo di motivazione;</li>
              <li>In caso di approvazione, Privatio invia all&rsquo;Agenzia un&rsquo;e-mail di conferma contenente un link univoco per il completamento della registrazione;</li>
              <li>L&rsquo;Agenzia completa la registrazione e accetta il presente Contratto;</li>
              <li>L&rsquo;Agenzia seleziona il territorio operativo e procede al pagamento del primo abbonamento tramite Stripe.</li>
            </ul>
            <p><strong>2.2.</strong> L&rsquo;account dell&rsquo;Agenzia diventa attivo solo a seguito del perfezionamento del primo pagamento.</p>
            <p><strong>2.3.</strong> Privatio si riserva il diritto di richiedere documentazione integrativa (visura camerale, certificato di iscrizione al Registro, polizza RC professionale) a conferma dei requisiti dichiarati.</p>
          </Section>

          {/* Art. 3 */}
          <Section title="Art. 3 – Piani di Abbonamento e Servizi">
            <p><strong>3.1.</strong> Privatio offre i seguenti piani di abbonamento:</p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs border border-border rounded">
                <thead>
                  <tr className="bg-bg-soft">
                    <th className="p-2 text-left border-b border-border">Caratteristica</th>
                    <th className="p-2 text-center border-b border-border">Base</th>
                    <th className="p-2 text-center border-b border-border">Locale</th>
                    <th className="p-2 text-center border-b border-border">City</th>
                    <th className="p-2 text-center border-b border-border">Prime</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="p-2 border-b border-border">Aree operative</td><td className="p-2 text-center border-b border-border">1</td><td className="p-2 text-center border-b border-border">2</td><td className="p-2 text-center border-b border-border">3</td><td className="p-2 text-center border-b border-border">3-4</td></tr>
                  <tr><td className="p-2 border-b border-border">Max competitor/zona</td><td className="p-2 text-center border-b border-border">6</td><td className="p-2 text-center border-b border-border">5</td><td className="p-2 text-center border-b border-border">4</td><td className="p-2 text-center border-b border-border">3</td></tr>
                  <tr><td className="p-2 border-b border-border">Notifica nuovi immobili</td><td className="p-2 text-center border-b border-border">24h</td><td className="p-2 text-center border-b border-border">8h</td><td className="p-2 text-center border-b border-border">2h</td><td className="p-2 text-center border-b border-border">30min</td></tr>
                  <tr><td className="p-2 border-b border-border">Profilo agenzia</td><td className="p-2 text-center border-b border-border">Base</td><td className="p-2 text-center border-b border-border">Avanzato</td><td className="p-2 text-center border-b border-border">Alta visibilit&agrave;</td><td className="p-2 text-center border-b border-border">Prima posizione</td></tr>
                  <tr><td className="p-2">Dashboard</td><td className="p-2 text-center">Base</td><td className="p-2 text-center">Avanzata</td><td className="p-2 text-center">Statistiche</td><td className="p-2 text-center">Completa</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3"><strong>3.2.</strong> Il prezzo dell&rsquo;abbonamento &egrave; determinato in base al piano prescelto e alla classificazione della zona territoriale selezionata, secondo il listino prezzi pubblicato sulla Piattaforma. Il prezzo &egrave; espresso in Euro, al netto dell&rsquo;IVA.</p>
            <p><strong>3.3.</strong> L&rsquo;Agenzia pu&ograve; attivare pi&ugrave; territori operativi nei limiti previsti dal proprio piano.</p>
            <p><strong>3.4.</strong> Il piano complessivo corrisponde al piano di livello pi&ugrave; elevato tra quelli attivi sui propri territori.</p>
            <p><strong>3.5.</strong> Ciascuna zona territoriale prevede un numero massimo di agenzie convenzionate (slot).</p>
            <p><strong>3.6.</strong> Privatio si riserva il diritto di modificare il listino prezzi con un preavviso di almeno 30 giorni. Le modifiche si applicano al rinnovo successivo.</p>
          </Section>

          {/* Art. 4 */}
          <Section title="Art. 4 – Pagamenti e Fatturazione">
            <p><strong>4.1.</strong> Il pagamento avviene con cadenza mensile, in via anticipata, tramite Stripe. L&rsquo;Agenzia autorizza l&rsquo;addebito automatico del canone mensile.</p>
            <p><strong>4.2.</strong> L&rsquo;abbonamento si rinnova automaticamente ogni mese, salvo disdetta (Art. 9).</p>
            <p><strong>4.3.</strong> In caso di mancato pagamento, Privatio invier&agrave; un sollecito. Se non regolarizzato entro 7 giorni, Privatio potr&agrave; sospendere l&rsquo;accesso.</p>
            <p><strong>4.4.</strong> Mancato pagamento oltre 30 giorni: risoluzione di diritto ai sensi dell&rsquo;art. 1456 c.c. (clausola risolutiva espressa).</p>
            <p><strong>4.5.</strong> Privatio emetter&agrave; regolare fattura elettronica tramite SDI. L&rsquo;Agenzia si impegna a fornire e mantenere aggiornati i dati di fatturazione.</p>
            <p><strong>4.6.</strong> In caso di aggiunta o rimozione di territori, il canone sar&agrave; ricalcolato pro-rata.</p>
          </Section>

          {/* Art. 5 */}
          <Section title="Art. 5 – Trattamento dei Lead e Dati dei Venditori">
            <p><strong>5.1.</strong> I dati dei venditori trasmessi all&rsquo;Agenzia sono forniti esclusivamente per instaurare un contatto professionale ai fini della valutazione e dell&rsquo;eventuale conferimento dell&rsquo;incarico di vendita.</p>
            <p><strong>5.2.</strong> L&rsquo;Agenzia si impegna a:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Trattare i dati con la massima riservatezza e in conformit&agrave; al GDPR;</li>
              <li>Utilizzare i Lead esclusivamente per la finalit&agrave; prevista;</li>
              <li>Non cedere, comunicare o diffondere a terzi i dati dei venditori;</li>
              <li>Cancellare i dati entro 90 giorni se non si instaura un rapporto professionale;</li>
              <li>Informare tempestivamente Privatio in caso di data breach.</li>
            </ul>
            <p><strong>5.3.</strong> L&rsquo;Agenzia agisce come Titolare autonomo del trattamento dei dati personali ricevuti tramite la Piattaforma.</p>
          </Section>

          {/* Art. 5-bis */}
          <Section title="Art. 5-bis – Condizione di Zero Provvigioni al Venditore">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
              <p className="text-amber-800 font-medium text-xs uppercase tracking-wide mb-2">Clausola essenziale</p>
              <p className="text-amber-900">
                <strong>5-bis.1.</strong> L&rsquo;Agenzia accetta volontariamente, quale condizione essenziale per l&rsquo;accesso
                ai servizi, di <strong>non richiedere, addebitare, trattenere o percepire a qualsiasi titolo alcuna provvigione,
                commissione, compenso, rimborso spese o corrispettivo di qualsiasi natura dal venditore</strong> il cui contatto
                sia stato acquisito tramite Privatio.
              </p>
            </div>
            <p><strong>5-bis.2.</strong> Tale impegno &egrave; assunto liberamente in quanto: (a) il modello di business di Privatio si fonda sulla gratuit&agrave; per i venditori; (b) la violazione arrecherebbe danno alla reputazione della Piattaforma; (c) l&rsquo;Agenzia riceve Lead qualificati con facolt&agrave; di percepire provvigioni dall&rsquo;acquirente.</p>
            <p><strong>5-bis.3.</strong> L&rsquo;obbligo si applica a: provvigione di mediazione, qualsiasi forma di compenso anche denominato diversamente, qualsiasi importo in connessione con l&rsquo;incarico originato dal Lead Privatio.</p>
            <p><strong>5-bis.4.</strong> La provvigione potr&agrave; essere posta esclusivamente a carico dell&rsquo;acquirente.</p>
            <p><strong>5-bis.5.</strong> L&rsquo;Agenzia si impegna a inserire nell&rsquo;incarico di vendita la dicitura che nessuna provvigione &egrave; dovuta dal venditore.</p>
            <p><strong>5-bis.6. Violazione &mdash; Clausola risolutiva espressa e penale graduata:</strong></p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Risoluzione di diritto del Contratto (art. 1456 c.c.);</li>
              <li>Restituzione integrale al venditore di ogni importo percepito;</li>
              <li>Penale graduata: &euro;1.000 (importo &lt; &euro;2.000), &euro;3.000 (importo &euro;2.000-&euro;10.000), &euro;5.000 (importo &gt; &euro;10.000);</li>
              <li>Possibile segnalazione alla Camera di Commercio;</li>
              <li>Divieto permanente di re-iscrizione alla Piattaforma.</li>
            </ul>
            <p><strong>5-bis.7.</strong> Privatio si riserva il diritto di effettuare verifiche sul rispetto dell&rsquo;obbligo di zero provvigioni.</p>
          </Section>

          {/* Art. 6 */}
          <Section title="Art. 6 – Obblighi dell'Agenzia">
            <p><strong>6.1.</strong> L&rsquo;Agenzia si impegna a:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Mantenere l&rsquo;iscrizione al Registro degli Agenti di Affari in Mediazione;</li>
              <li>Comunicare tempestivamente variazioni dei dati identificativi o professionali;</li>
              <li>Mantenere il profilo aggiornato con informazioni veritiere;</li>
              <li>Fornire un servizio professionale, corretto e trasparente;</li>
              <li>Non ledere la reputazione di Privatio;</li>
              <li>Non utilizzare la Piattaforma per finalit&agrave; illecite;</li>
              <li>Non effettuare scraping, data mining o reverse engineering;</li>
              <li>Non condividere le credenziali di accesso;</li>
              <li>Mantenere attiva una polizza RC professionale.</li>
            </ul>
            <p><strong>6.2.</strong> L&rsquo;Agenzia &egrave; responsabile dell&rsquo;operato di tutti gli agenti e collaboratori che accedono tramite il proprio account.</p>
          </Section>

          {/* Art. 7 */}
          <Section title="Art. 7 – Obblighi di Privatio">
            <p><strong>7.1.</strong> Privatio si impegna a:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Garantire il corretto funzionamento della Piattaforma;</li>
              <li>Trasmettere i Lead secondo le modalit&agrave; del piano;</li>
              <li>Proteggere i dati con adeguate misure di sicurezza (GDPR);</li>
              <li>Comunicare tempestivamente interruzioni programmate;</li>
              <li>Fornire assistenza tecnica.</li>
            </ul>
            <p><strong>7.2.</strong> Privatio non garantisce un numero minimo di Lead o risultati commerciali specifici.</p>
          </Section>

          {/* Art. 8 */}
          <Section title="Art. 8 – Limitazione di Responsabilit&agrave;">
            <p><strong>8.1.</strong> Privatio non &egrave; responsabile per: veridicit&agrave; delle informazioni dei venditori, mancata conclusione di compravendite, comportamento dei venditori, interruzioni tecniche, danni indiretti o perdite di profitto.</p>
            <p><strong>8.2.</strong> La responsabilit&agrave; complessiva di Privatio non potr&agrave; eccedere l&rsquo;importo dei canoni versati nei 12 mesi precedenti. Esclusi: dolo, colpa grave, violazione GDPR.</p>
            <p><strong>8.3.</strong> Il prezzo dell&rsquo;abbonamento tiene conto della presente limitazione.</p>
          </Section>

          {/* Art. 8-bis */}
          <Section title="Art. 8-bis – Manleva e Indennit&agrave;">
            <p><strong>8-bis.1.</strong> L&rsquo;Agenzia manleva Privatio da pretese derivanti da: esercizio dell&rsquo;attivit&agrave; di mediazione, reclami dei venditori, violazione dei Termini, violazione GDPR, controversie con terzi, perdita dei requisiti professionali.</p>
            <p><strong>8-bis.2.</strong> Non si applica per dolo/colpa grave di Privatio o difetti della Piattaforma.</p>
            <p><strong>8-bis.3.</strong> La manleva sopravvive alla cessazione del Contratto per 24 mesi.</p>
          </Section>

          {/* Art. 9 */}
          <Section title="Art. 9 – Durata, Recesso e Risoluzione">
            <p><strong>9.1.</strong> Contratto a durata indeterminata dalla data di attivazione.</p>
            <p><strong>9.2.</strong> Recesso libero dell&rsquo;Agenzia in qualsiasi momento tramite portale Stripe o comunicazione scritta. Nessun rimborso dei canoni gi&agrave; corrisposti.</p>
            <p><strong>9.3.</strong> Rimozione singoli territori in qualsiasi momento con adeguamento proporzionale del canone.</p>
            <p><strong>9.4.</strong> Recesso di Privatio con preavviso di 30 giorni.</p>
            <p><strong>9.5.</strong> Risoluzione immediata di Privatio per: mancato pagamento oltre 30 giorni, perdita iscrizione al Registro, violazione riservatezza, violazione Art. 5-bis, utilizzo improprio dei Lead, comportamento lesivo.</p>
            <p><strong>9.6.</strong> In caso di risoluzione per inadempimento, Privatio ha diritto al risarcimento del danno.</p>
          </Section>

          {/* Art. 10 */}
          <Section title="Art. 10 – Propriet&agrave; Intellettuale">
            <p><strong>10.1.</strong> Tutti i diritti di propriet&agrave; intellettuale sulla Piattaforma restano di Privatio.</p>
            <p><strong>10.2.</strong> Licenza d&rsquo;uso limitata, non esclusiva, non cedibile e revocabile.</p>
            <p><strong>10.3.</strong> Uso del marchio &ldquo;Privatio&rdquo; solo per indicare lo status di agenzia convenzionata.</p>
          </Section>

          {/* Art. 11 */}
          <Section title="Art. 11 – Riservatezza">
            <p><strong>11.1.</strong> Ciascuna parte tratta come riservate tutte le informazioni commerciali, tecniche o organizzative.</p>
            <p><strong>11.2.</strong> Eccezioni: informazioni gi&agrave; pubbliche o divulgazione imposta dalla legge.</p>
            <p><strong>11.3.</strong> Obbligo di riservatezza per 24 mesi dopo la cessazione del Contratto.</p>
          </Section>

          {/* Art. 12 */}
          <Section title="Art. 12 – Modifiche al Contratto e ai Servizi">
            <p><strong>12.1.</strong> Privatio pu&ograve; modificare il Contratto con preavviso di 30 giorni via e-mail.</p>
            <p><strong>12.2.</strong> L&rsquo;Agenzia pu&ograve; recedere prima dell&rsquo;entrata in vigore delle modifiche, senza penali.</p>
            <p><strong>12.3.</strong> Le modifiche ai prezzi si applicano solo ai rinnovi successivi.</p>
          </Section>

          {/* Art. 13 */}
          <Section title="Art. 13 – Trattamento dei Dati Personali dell'Agenzia">
            <p><strong>13.1.</strong> Privatio tratta i dati del referente e degli agenti come Titolare del trattamento per: esecuzione del Contratto, adempimenti fiscali, legittimo interesse.</p>
            <p><strong>13.2.</strong> Conservazione per la durata del Contratto e 10 anni per adempimenti fiscali.</p>
            <p><strong>13.3.</strong> Diritti previsti dagli artt. 15-22 del GDPR.</p>
            <p><strong>13.4.</strong> Per l&rsquo;informativa completa: <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.</p>
          </Section>

          {/* Art. 14 */}
          <Section title="Art. 14 – Legge Applicabile e Foro Competente">
            <p><strong>14.1.</strong> Contratto regolato dalla legge italiana.</p>
            <p><strong>14.2.</strong> Tentativo obbligatorio di mediazione (D.Lgs. 28/2010) entro 60 giorni.</p>
            <p><strong>14.3.</strong> {/* TODO: Inserire foro competente quando la società sarà costituita */}
              Foro esclusivo di Torino.</p>
            <p><strong>14.4.</strong> Salvi i provvedimenti cautelari e d&rsquo;urgenza.</p>
          </Section>

          {/* Art. 15 */}
          <Section title="Art. 15 – Disposizioni Finali">
            <p><strong>15.1.</strong> Il Contratto costituisce l&rsquo;accordo integrale tra le parti.</p>
            <p><strong>15.2.</strong> Nullit&agrave; parziale: le clausole valide restano efficaci.</p>
            <p><strong>15.3.</strong> Il mancato esercizio di un diritto non costituisce rinuncia.</p>
            <p><strong>15.4.</strong> L&rsquo;Agenzia non pu&ograve; cedere il Contratto senza consenso scritto di Privatio.</p>
            <p><strong>15.5.</strong> Comunicazioni via e-mail agli indirizzi indicati in sede di registrazione.</p>
          </Section>

          {/* Art. 16 */}
          <Section title="Art. 16 – Approvazione Specifica (Artt. 1341 e 1342 c.c.)">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 font-medium text-xs uppercase tracking-wide mb-2">Doppia sottoscrizione richiesta</p>
              <p className="text-amber-900 text-sm">
                Ai sensi e per gli effetti degli articoli 1341 e 1342 del Codice Civile, l&rsquo;Agenzia dichiara di aver
                letto e di approvare specificamente le seguenti clausole:
              </p>
              <p className="text-amber-900 text-sm mt-2">
                Art. 1 (Oggetto del contratto); Art. 2 (Procedura di convenzionamento); Art. 3 (Piani di abbonamento e slot);
                Art. 4 (Pagamenti e clausola risolutiva); Art. 5 (Trattamento Lead e riservatezza); Art. 5-bis (Zero provvigioni,
                clausola risolutiva e penale); Art. 6 (Obblighi dell&rsquo;Agenzia); Art. 8 (Limitazione di responsabilit&agrave;);
                Art. 8-bis (Manleva); Art. 9 (Durata, recesso e risoluzione); Art. 10 (Propriet&agrave; intellettuale);
                Art. 12 (Modifiche al Contratto); Art. 14 (Mediazione e foro competente); Art. 15 (Cessione del Contratto).
              </p>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-text-muted">
          <p>Privatio &mdash; Piattaforma Tecnologica di Vetrina Immobiliare Digitale</p>
          <p className="mt-1">Versione 1.0 &mdash; Marzo 2026</p>
        </div>
      </div>
    </div>
  );
}
