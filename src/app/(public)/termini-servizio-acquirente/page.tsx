import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Termini di Servizio Acquirente | Privatio",
  description:
    "Termini e condizioni di servizio della piattaforma Privatio per utenti acquirenti.",
};

export default function TerminiAcquirentePage() {
  return (
    <>
      <Header />
      <main className="py-16 bg-bg-soft">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-light tracking-[-0.03em] text-primary-dark mb-2">
            Termini e Condizioni di Servizio
          </h1>
          <p className="text-sm text-text-muted mb-8">
            Utente Acquirente &mdash; Versione 1.0 &mdash; Marzo 2026
          </p>
          <div className="bg-white rounded-xl p-8 border border-border prose prose-slate max-w-none text-[15px]">
            {/* PREMESSE */}
            <h2 className="text-lg font-medium text-text mt-0">Premesse</h2>
            <p className="text-text-muted">
              Il presente documento disciplina i termini e le condizioni di utilizzo della piattaforma
              Privatio (di seguito &ldquo;la Piattaforma&rdquo;) da parte dell&apos;utente che accede
              alla Piattaforma per consultare annunci immobiliari, cercare immobili in vendita o contattare
              agenzie immobiliari convenzionate (di seguito &ldquo;l&apos;Acquirente&rdquo; o &ldquo;l&apos;Utente&rdquo;).
            </p>
            <p className="text-text-muted mt-2">
              La Piattaforma &egrave; gestita da Privatio S.r.l., con sede legale in Torino
              (di seguito &ldquo;Privatio&rdquo; o &ldquo;il Titolare&rdquo;).
            </p>
            <p className="text-text-muted mt-2">
              L&apos;utilizzo della Piattaforma da parte dell&apos;Acquirente implica l&apos;accettazione
              integrale dei presenti Termini. Per alcune funzionalit&agrave; (salvataggio ricerche,
              contatto agenzie) &egrave; richiesta la registrazione di un account; in tal caso
              l&apos;accettazione avviene anche mediante selezione dell&apos;apposita casella di conferma
              (checkbox), con tracciamento di indirizzo IP, data e ora (timestamp) e indirizzo e-mail verificato.
            </p>

            {/* ART. 1 */}
            <h2 className="text-lg font-medium text-text mt-8">
              Art. 1 &mdash; Natura del servizio e qualificazione giuridica
            </h2>
            <p className="text-text-muted">
              <strong>1.1.</strong> La Piattaforma Privatio fornisce un servizio tecnologico di vetrina
              digitale immobiliare che consente all&apos;Acquirente di:
            </p>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>
                consultare gli annunci immobiliari pubblicati dai venditori sulla Piattaforma;
              </li>
              <li>
                visualizzare l&apos;elenco delle agenzie immobiliari convenzionate operanti nelle zone
                di interesse;
              </li>
              <li>
                contattare direttamente le agenzie convenzionate tramite i canali messi a disposizione
                dalla Piattaforma;
              </li>
              <li>
                salvare ricerche e immobili di interesse (previa registrazione).
              </li>
            </ul>

            <p className="text-text-muted mt-3">
              <strong>1.2.</strong> Privatio <strong>NON &egrave; un&apos;agenzia immobiliare</strong> e
              non svolge attivit&agrave; di mediazione immobiliare ai sensi dell&apos;art. 1754 del
              Codice Civile e della Legge 3 febbraio 1989, n. 39. In particolare, Privatio:
            </p>
            <ol className="text-text-muted list-[lower-alpha] pl-6 space-y-1">
              <li>
                non mette in relazione le parti per la conclusione di un affare;
              </li>
              <li>
                non partecipa in alcun modo alla trattativa tra Acquirente e venditore o agenzia
                immobiliare;
              </li>
              <li>non ha alcun potere di rappresentanza dell&apos;Acquirente;</li>
              <li>
                non determina n&eacute; influenza le condizioni della compravendita;
              </li>
              <li>
                non percepisce provvigioni, compensi o commissioni commisurati al valore della
                compravendita degli immobili.
              </li>
            </ol>

            <p className="text-text-muted mt-3">
              <strong>1.3.</strong> Il servizio di consultazione degli annunci sulla Piattaforma
              &egrave; gratuito per l&apos;Acquirente.
            </p>
            <p className="text-text-muted mt-2">
              <strong>1.4.</strong> L&apos;eventuale compravendita immobiliare &egrave; un rapporto che
              intercorre esclusivamente tra l&apos;Acquirente, il venditore e/o l&apos;agenzia immobiliare.
              Privatio &egrave; del tutto estranea a tale rapporto e non assume alcuna responsabilit&agrave;
              in merito.
            </p>

            {/* ART. 2 */}
            <h2 className="text-lg font-medium text-text mt-8">
              Art. 2 &mdash; Registrazione e account
            </h2>
            <p className="text-text-muted">
              <strong>2.1.</strong> La consultazione degli annunci immobiliari sulla Piattaforma &egrave;
              accessibile senza registrazione. Per accedere a funzionalit&agrave; avanzate (salvataggio
              ricerche, contatto diretto con agenzie, segnalazione immobili di interesse),
              l&apos;Acquirente deve creare un account fornendo un indirizzo e-mail valido e verificato.
            </p>
            <p className="text-text-muted mt-2">
              <strong>2.2.</strong> L&apos;Acquirente &egrave; responsabile della custodia delle proprie
              credenziali di accesso e di ogni attivit&agrave; svolta tramite il proprio account. In caso
              di accesso non autorizzato, l&apos;Acquirente deve darne tempestiva comunicazione a Privatio.
            </p>
            <p className="text-text-muted mt-2">
              <strong>2.3.</strong> L&apos;Acquirente pu&ograve; cancellare il proprio account in qualsiasi
              momento tramite le impostazioni del profilo o inviando richiesta a{" "}
              <strong>info@privatio.it</strong>.
            </p>

            {/* ART. 3 */}
            <h2 className="text-lg font-medium text-text mt-8">
              Art. 3 &mdash; Informazioni sugli immobili e limitazioni di responsabilit&agrave;
            </h2>
            <p className="text-text-muted">
              <strong>3.1.</strong> Le informazioni relative agli immobili presenti sulla Piattaforma
              (descrizioni, caratteristiche, fotografie, prezzi indicativi, localizzazione) sono fornite
              direttamente dai venditori sotto la propria esclusiva responsabilit&agrave;.
            </p>
            <p className="text-text-muted mt-2">
              <strong>3.2.</strong> Privatio non verifica, non garantisce e non si assume alcuna
              responsabilit&agrave; in merito a:
            </p>
            <ol className="text-text-muted list-[lower-alpha] pl-6 space-y-1">
              <li>
                la veridicit&agrave;, accuratezza, completezza o aggiornamento delle informazioni sugli
                immobili;
              </li>
              <li>l&apos;effettiva disponibilit&agrave; degli immobili per la vendita;</li>
              <li>
                la conformit&agrave; degli immobili alle normative urbanistiche, catastali, edilizie o di
                altra natura;
              </li>
              <li>
                la legittimazione del venditore a disporre dell&apos;immobile;
              </li>
              <li>
                l&apos;assenza di vizi, difetti, gravami, ipoteche o altri oneri sull&apos;immobile.
              </li>
            </ol>
            <p className="text-text-muted mt-2">
              <strong>3.3.</strong> Le eventuali indicazioni di prezzo presenti sulla Piattaforma sono
              esclusivamente quelle inserite dal venditore e non costituiscono in alcun modo una valutazione,
              una stima o un suggerimento da parte di Privatio. L&apos;Acquirente &egrave; invitato a
              effettuare le proprie verifiche indipendenti prima di assumere qualsiasi decisione d&apos;acquisto.
            </p>
            <p className="text-text-muted mt-2">
              <strong>3.4.</strong> Privatio raccomanda all&apos;Acquirente di avvalersi di professionisti
              qualificati (notai, tecnici, periti) per la verifica delle informazioni e dello stato giuridico
              e tecnico dell&apos;immobile prima della conclusione di qualsiasi operazione di compravendita.
            </p>

            {/* ART. 4 */}
            <h2 className="text-lg font-medium text-text mt-8">
              Art. 4 &mdash; Rapporto con le agenzie convenzionate
            </h2>
            <p className="text-text-muted">
              <strong>4.1.</strong> Tramite la Piattaforma l&apos;Acquirente pu&ograve; entrare in contatto
              con agenzie immobiliari convenzionate. Il rapporto professionale che ne deriva intercorre
              esclusivamente tra l&apos;Acquirente e l&apos;agenzia, e Privatio &egrave; del tutto estranea
              a tale rapporto.
            </p>
            <p className="text-text-muted mt-2">
              <strong>4.2.</strong> Le agenzie convenzionate con Privatio operano secondo un modello in cui
              non richiedono provvigioni al venditore. L&apos;Acquirente prende atto che l&apos;agenzia
              potr&agrave; richiedere una provvigione all&apos;Acquirente stesso, nei termini e nelle misure
              concordate direttamente tra l&apos;Acquirente e l&apos;agenzia. Privatio non interviene nella
              determinazione di tale provvigione.
            </p>
            <p className="text-text-muted mt-2">
              <strong>4.3.</strong> Privatio non garantisce la qualit&agrave;, la professionalit&agrave; o
              l&apos;affidabilit&agrave; delle agenzie convenzionate, pur effettuando una verifica iniziale
              dei requisiti di iscrizione al Registro degli Agenti di Affari in Mediazione.
            </p>
            <p className="text-text-muted mt-2">
              <strong>4.4.</strong> Eventuali controversie tra l&apos;Acquirente e un&apos;agenzia
              convenzionata dovranno essere risolte direttamente tra le parti interessate. Privatio non
              &egrave; parte di tali controversie e non assume alcun obbligo di mediazione o intervento,
              fermo restando il proprio impegno a raccogliere segnalazioni per migliorare la qualit&agrave;
              del servizio.
            </p>

            {/* ART. 5 */}
            <h2 className="text-lg font-medium text-text mt-8">
              Art. 5 &mdash; Obblighi dell&apos;Acquirente
            </h2>
            <p className="text-text-muted">
              <strong>5.1.</strong> L&apos;Acquirente si impegna a:
            </p>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>
                utilizzare la Piattaforma in buona fede e per le finalit&agrave; per cui &egrave;
                destinata (ricerca immobiliare);
              </li>
              <li>fornire informazioni veritiere in caso di registrazione;</li>
              <li>
                non utilizzare la Piattaforma per finalit&agrave; illecite, fraudolente o contrarie
                all&apos;ordine pubblico;
              </li>
              <li>
                non effettuare attivit&agrave; di scraping, data mining, estrazione automatizzata di dati
                o reverse engineering della Piattaforma;
              </li>
              <li>
                non contattare i venditori aggirando i canali previsti dalla Piattaforma.
              </li>
            </ul>
            <p className="text-text-muted mt-2">
              <strong>5.2.</strong> In caso di violazione, Privatio si riserva il diritto di sospendere o
              chiudere l&apos;account dell&apos;Acquirente, previa comunicazione e-mail con indicazione
              della violazione contestata e concessione di un termine di 5 giorni lavorativi per le
              controdeduzioni, salvo i casi di grave urgenza.
            </p>

            {/* ART. 6 */}
            <h2 className="text-lg font-medium text-text mt-8">
              Art. 6 &mdash; Limitazione di responsabilit&agrave; di Privatio
            </h2>
            <p className="text-text-muted">
              <strong>6.1.</strong> Privatio &egrave; responsabile esclusivamente per il funzionamento
              tecnico della Piattaforma e non per i contenuti pubblicati dai venditori o per le attivit&agrave;
              delle agenzie convenzionate.
            </p>
            <p className="text-text-muted mt-2">
              <strong>6.2.</strong> Privatio non risponde per:
            </p>
            <ol className="text-text-muted list-[lower-alpha] pl-6 space-y-1">
              <li>
                danni derivanti dall&apos;utilizzo o dall&apos;impossibilit&agrave; di utilizzo della
                Piattaforma;
              </li>
              <li>
                interruzioni, ritardi o malfunzionamenti del servizio dovuti a cause di forza maggiore,
                interventi di manutenzione o problemi tecnici di terze parti;
              </li>
              <li>
                danni derivanti da decisioni d&apos;acquisto assunte dall&apos;Acquirente sulla base delle
                informazioni presenti sulla Piattaforma;
              </li>
              <li>
                danni derivanti da comportamenti illeciti di venditori o agenzie.
              </li>
            </ol>
            <p className="text-text-muted mt-2">
              <strong>6.3.</strong> In ogni caso, la responsabilit&agrave; complessiva di Privatio nei
              confronti dell&apos;Acquirente per qualsiasi danno derivante dall&apos;utilizzo della
              Piattaforma non potr&agrave; eccedere l&apos;importo di EUR 100,00 (cento/00).
            </p>

            {/* ART. 7 */}
            <h2 className="text-lg font-medium text-text mt-8">
              Art. 7 &mdash; Propriet&agrave; intellettuale
            </h2>
            <p className="text-text-muted">
              <strong>7.1.</strong> Tutti i diritti di propriet&agrave; intellettuale relativi alla
              Piattaforma (software, interfacce, algoritmi, database, marchi, loghi, contenuti originali)
              restano di esclusiva titolarit&agrave; di Privatio.
            </p>
            <p className="text-text-muted mt-2">
              <strong>7.2.</strong> L&apos;Acquirente &egrave; autorizzato a utilizzare la Piattaforma
              esclusivamente per uso personale e non commerciale, nei limiti delle funzionalit&agrave;
              messe a disposizione. &Egrave; vietata qualsiasi riproduzione, distribuzione, modifica o
              utilizzo commerciale dei contenuti della Piattaforma senza autorizzazione scritta di Privatio.
            </p>

            {/* ART. 8 */}
            <h2 className="text-lg font-medium text-text mt-8">
              Art. 8 &mdash; Trattamento dei dati personali
            </h2>
            <p className="text-text-muted">
              <strong>8.1.</strong> Privatio tratta i dati personali dell&apos;Acquirente in qualit&agrave;
              di Titolare del trattamento, in conformit&agrave; al Regolamento UE 2016/679 (GDPR) e alla
              normativa italiana vigente.
            </p>
            <p className="text-text-muted mt-2">
              <strong>8.2.</strong> I dati dell&apos;Acquirente sono trattati per le seguenti finalit&agrave;:
            </p>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>
                navigazione e consultazione della Piattaforma (legittimo interesse, Art. 6, par. 1, lett. f,
                GDPR);
              </li>
              <li>
                creazione e gestione dell&apos;account (esecuzione del contratto, Art. 6, par. 1, lett. b,
                GDPR);
              </li>
              <li>invio di comunicazioni relative al servizio (legittimo interesse);</li>
              <li>
                analisi statistiche anonime per il miglioramento del servizio (previo consenso per cookie
                analitici);
              </li>
              <li>
                invio di comunicazioni promozionali (previo consenso esplicito dell&apos;Acquirente).
              </li>
            </ul>
            <p className="text-text-muted mt-2">
              <strong>8.3.</strong> I dati di navigazione (cookie tecnici, analitici, di marketing) sono
              trattati secondo quanto indicato nella{" "}
              <a href="/cookie-policy" className="text-primary hover:underline">
                Cookie Policy
              </a>
              . L&apos;Acquirente pu&ograve; gestire le proprie preferenze tramite il banner di consenso
              cookie e in qualsiasi momento tramite il link &ldquo;Gestisci cookie&rdquo; nel footer della
              Piattaforma.
            </p>
            <p className="text-text-muted mt-2">
              <strong>8.4.</strong> L&apos;Acquirente gode di tutti i diritti previsti dagli artt. 15-22
              del GDPR (accesso, rettifica, cancellazione, limitazione, portabilit&agrave;, opposizione).
              Per esercitarli &egrave; possibile scrivere a{" "}
              <strong>privacy@privatio.it</strong>.
            </p>
            <p className="text-text-muted mt-2">
              <strong>8.5.</strong> Per l&apos;informativa completa si rimanda alla{" "}
              <a href="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </a>{" "}
              disponibile sulla Piattaforma.
            </p>

            {/* ART. 9 */}
            <h2 className="text-lg font-medium text-text mt-8">
              Art. 9 &mdash; Modifiche ai Termini
            </h2>
            <p className="text-text-muted">
              <strong>9.1.</strong> Privatio si riserva il diritto di modificare i presenti Termini in
              qualsiasi momento. Le modifiche saranno pubblicate sulla Piattaforma e, per gli utenti
              registrati, comunicate via e-mail almeno 15 (quindici) giorni prima della loro entrata in
              vigore.
            </p>
            <p className="text-text-muted mt-2">
              <strong>9.2.</strong> L&apos;utilizzo continuato della Piattaforma dopo l&apos;entrata in
              vigore delle modifiche costituisce accettazione dei nuovi Termini. L&apos;Acquirente registrato
              che non intenda accettare le modifiche potr&agrave; cancellare il proprio account prima della
              data di entrata in vigore.
            </p>

            {/* ART. 10 */}
            <h2 className="text-lg font-medium text-text mt-8">
              Art. 10 &mdash; Legge applicabile e foro competente
            </h2>
            <p className="text-text-muted">
              <strong>10.1.</strong> I presenti Termini sono regolati dalla legge italiana.
            </p>
            <p className="text-text-muted mt-2">
              <strong>10.2.</strong> Per le controversie con consumatori ai sensi del D.Lgs. 206/2005
              (Codice del Consumo), &egrave; competente il Foro del luogo di residenza o domicilio del
              consumatore.
            </p>
            <p className="text-text-muted mt-2">
              <strong>10.3.</strong> Per le controversie con utenti non consumatori, sar&agrave; competente
              in via esclusiva il Foro di Torino.
            </p>
            <p className="text-text-muted mt-2">
              <strong>10.4.</strong> Ai sensi del Regolamento UE 524/2013, l&apos;Acquirente consumatore
              pu&ograve; utilizzare la piattaforma ODR (Online Dispute Resolution) della Commissione Europea
              per la risoluzione alternativa delle controversie, accessibile all&apos;indirizzo:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>

            {/* ART. 11 */}
            <h2 className="text-lg font-medium text-text mt-8">
              Art. 11 &mdash; Disposizioni finali
            </h2>
            <p className="text-text-muted">
              <strong>11.1.</strong> I presenti Termini costituiscono l&apos;accordo integrale tra
              l&apos;Acquirente e Privatio in relazione all&apos;utilizzo della Piattaforma.
            </p>
            <p className="text-text-muted mt-2">
              <strong>11.2.</strong> L&apos;eventuale nullit&agrave;, annullabilit&agrave; o inefficacia
              di una o pi&ugrave; clausole non pregiudica la validit&agrave; delle restanti.
            </p>
            <p className="text-text-muted mt-2">
              <strong>11.3.</strong> Il mancato esercizio da parte di Privatio di un diritto previsto dai
              presenti Termini non costituisce rinuncia a tale diritto.
            </p>

            {/* ART. 12 */}
            <h2 className="text-lg font-medium text-text mt-8">
              Art. 12 &mdash; Approvazione specifica (artt. 1341 e 1342 c.c.)
            </h2>
            <p className="text-text-muted">
              Ai sensi e per gli effetti degli articoli 1341 e 1342 del Codice Civile, l&apos;Acquirente
              dichiara di aver letto e di approvare specificamente le seguenti clausole:
            </p>
            <p className="text-text-muted mt-2 font-medium">
              Art. 1 (Natura del servizio e qualificazione non intermediaria); Art. 3 (Informazioni sugli
              immobili e limitazioni di responsabilit&agrave;); Art. 4 (Rapporto con le agenzie e
              provvigioni); Art. 6 (Limitazione di responsabilit&agrave; e tetto quantitativo); Art. 7
              (Propriet&agrave; intellettuale); Art. 9 (Modifiche unilaterali ai Termini); Art. 10 (Foro
              competente esclusivo per non consumatori).
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
