import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Termini di Servizio | Privatio",
  description: "Termini e condizioni di servizio della piattaforma Privatio per utenti venditori.",
};

export default function TerminiPage() {
  return (
    <>
      <Header />
      <main className="py-16 bg-bg-soft">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-light tracking-[-0.03em] text-primary-dark mb-2">Termini e Condizioni di Servizio</h1>
          <p className="text-sm text-text-muted mb-8">Utente Venditore &mdash; Versione 2.0 &mdash; Marzo 2026</p>
          <div className="bg-white rounded-xl p-8 border border-border prose prose-slate max-w-none text-[15px]">

            <h2 className="text-lg font-medium text-text mt-0">Premesse</h2>
            <p className="text-text-muted">
              Il presente documento disciplina i termini e le condizioni di utilizzo della piattaforma Privatio
              da parte dell&apos;utente che intende pubblicare uno o pi&ugrave; immobili in vendita (&ldquo;il Venditore&rdquo;).
              L&apos;accettazione avviene in forma digitale al momento della prima pubblicazione, mediante selezione
              dell&apos;apposita casella di conferma. L&apos;accettazione &egrave; tracciata con: indirizzo IP, data e ora, email verificata.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">Art. 1 &mdash; Natura del servizio e qualificazione giuridica</h2>
            <p className="text-text-muted">
              La Piattaforma Privatio fornisce un servizio tecnologico di vetrina digitale: il Venditore carica le informazioni
              del proprio immobile, visualizza l&apos;elenco delle agenzie immobiliari convenzionate nella zona e pu&ograve;
              contattarle direttamente. Solo nel caso in cui il Venditore non contatti alcuna agenzia entro 48 ore,
              i suoi dati di contatto e le informazioni sull&apos;immobile saranno trasmessi alle agenzie della zona.
            </p>
            <p className="text-text-muted mt-2">
              Privatio <strong>NON &egrave; un&apos;agenzia immobiliare</strong> ai sensi dell&apos;art. 1754 c.c. e della L. 39/1989.
              Non mette in relazione le parti, non partecipa alle trattative, non ha potere di rappresentanza,
              non percepisce provvigioni sulle compravendite e non &egrave; iscritta al Registro degli Agenti di Affari in Mediazione.
            </p>
            <p className="text-text-muted mt-2">
              Il servizio &egrave; gratuito per il Venditore. La Piattaforma non fornisce valutazioni, stime o perizie immobiliari.
              Il modello di business si basa su servizi tecnologici forniti alle agenzie convenzionate (abbonamenti, servizi premium).
            </p>

            <h2 className="text-lg font-medium text-text mt-6">Art. 2 &mdash; Registrazione e pubblicazione</h2>
            <p className="text-text-muted">
              Per pubblicare un immobile, il Venditore deve creare un account con email verificata, compilare la scheda immobiliare
              e accettare i presenti Termini e la Privacy Policy. Il Venditore dichiara che le informazioni sono veritiere e che &egrave;
              legittimamente autorizzato a disporre dell&apos;immobile. Privatio si riserva il diritto di verificare e rimuovere annunci
              falsi o in violazione.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">Art. 3 &mdash; Visibilit&agrave; dei dati del Venditore</h2>
            <p className="text-text-muted">
              <strong>Fase 1 &mdash; Contatto attivo (0&ndash;48 ore):</strong> Le informazioni generali dell&apos;immobile sono visibili alle agenzie
              nella zona, ma i dati personali del Venditore NON sono comunicati. Il Venditore sceglie autonomamente chi contattare.
            </p>
            <p className="text-text-muted mt-2">
              <strong>Fase 2 &mdash; Invio automatico (dopo 48 ore):</strong> Se il Venditore non contatta nessuna agenzia entro 48 ore,
              i suoi dati di contatto vengono trasmessi automaticamente alle agenzie della zona, previo consenso specifico
              espresso con apposita casella separata. Il Venditore pu&ograve; revocare tale consenso in qualsiasi momento dalla dashboard.
            </p>
            <p className="text-text-muted mt-2">
              I dati NON saranno pubblicati su siti web pubblici o motori di ricerca.
              Le agenzie sono vincolate da obblighi contrattuali di riservatezza.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">Art. 4 &mdash; Diritto di rimozione</h2>
            <p className="text-text-muted">
              Il Venditore pu&ograve; rimuovere il proprio immobile in qualsiasi momento, senza preavviso, senza penali
              e senza motivazione, tramite la dashboard o scrivendo a info@privatio.it.
              I dati cessano di essere visibili entro 24 ore e vengono cancellati entro 30 giorni (salvo obblighi di legge).
            </p>

            <h2 className="text-lg font-medium text-text mt-6">Art. 5 &mdash; Obblighi del Venditore</h2>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>Fornire informazioni veritiere e aggiornate sull&apos;immobile</li>
              <li>Aggiornare la scheda in caso di variazioni significative (prezzo, disponibilit&agrave;)</li>
              <li>Rimuovere l&apos;annuncio se l&apos;immobile non &egrave; pi&ugrave; disponibile</li>
              <li>Non utilizzare la Piattaforma per finalit&agrave; illecite o fraudolente</li>
              <li>Non pubblicare contenuti offensivi, discriminatori o lesivi di diritti di terzi</li>
            </ul>
            <p className="text-text-muted mt-2">
              Il Venditore &egrave; l&apos;unico responsabile della veridicit&agrave; delle informazioni pubblicate.
              In caso di violazione, Privatio pu&ograve; richiedere la correzione, sospendere l&apos;annuncio o chiudere l&apos;account.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">Art. 5-bis &mdash; Usi vietati della Piattaforma</h2>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>Pubblicare immobili inesistenti o di cui non si ha la legittima disponibilit&agrave;</li>
              <li>Raccogliere dati delle agenzie per finalit&agrave; diverse da quelle previste</li>
              <li>Effettuare scraping, data mining o reverse engineering</li>
              <li>Utilizzare bot o strumenti automatizzati</li>
              <li>Pubblicare lo stesso immobile con pi&ugrave; account</li>
              <li>Svolgere attivit&agrave; di mediazione immobiliare tramite la Piattaforma</li>
            </ul>

            <h2 className="text-lg font-medium text-text mt-6">Art. 6 &mdash; Limitazione di responsabilit&agrave;</h2>
            <p className="text-text-muted">
              Privatio non garantisce la conclusione di trattative o compravendite. Non &egrave; responsabile per il comportamento
              delle agenzie, la mancata conclusione di trattative, interruzioni della Piattaforma o danni indiretti (salvo dolo o colpa grave).
              Le agenzie sono soggetti giuridici indipendenti; Privatio non controlla n&eacute; garantisce i loro servizi.
            </p>
            <p className="text-text-muted mt-2">
              Responsabilit&agrave; massima di Privatio: corrispettivi versati nei 12 mesi precedenti, o &euro;100 se il servizio &egrave; gratuito.
              Esclusi i casi di dolo.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">Art. 6-bis &mdash; Manleva e indennit&agrave;</h2>
            <p className="text-text-muted">
              Il Venditore manleva Privatio da qualsiasi pretesa derivante da: informazioni false o inesatte,
              violazione dei Termini, violazione di diritti di terzi, controversie con le agenzie.
              L&apos;obbligo di manleva sopravvive per 24 mesi dalla cessazione del rapporto.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">Art. 7 &mdash; Propriet&agrave; intellettuale</h2>
            <p className="text-text-muted">
              Il Venditore mantiene la propriet&agrave; dei contenuti caricati e concede a Privatio una licenza non esclusiva,
              gratuita e revocabile per mostrarli alle agenzie, creare copie tecniche e statistiche anonimizzate.
              La licenza si estingue con la rimozione dell&apos;annuncio.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">Art. 8 &mdash; Durata e recesso</h2>
            <p className="text-text-muted">
              Durata indeterminata. Il Venditore pu&ograve; recedere in qualsiasi momento cancellando l&apos;account
              o rimuovendo tutti gli immobili. Privatio pu&ograve; sospendere l&apos;account per violazioni con preavviso
              di almeno 15 giorni (salvo gravi violazioni che richiedano sospensione immediata).
            </p>

            <h2 className="text-lg font-medium text-text mt-6">Art. 9 &mdash; Modifiche ai termini</h2>
            <p className="text-text-muted">
              Le modifiche sostanziali saranno comunicate via email almeno 30 giorni prima dell&apos;entrata in vigore.
              Le modifiche formali o tecnico-organizzative con preavviso di 15 giorni. L&apos;uso continuato della Piattaforma
              dopo le modifiche costituisce accettazione.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">Art. 10 &mdash; Legge applicabile e foro competente</h2>
            <p className="text-text-muted">
              I presenti Termini sono regolati dalla legge italiana. Mediazione obbligatoria preventiva ai sensi del
              D.Lgs. 28/2010. In caso di mancato accordo, foro competente &egrave; il Foro di Torino, salve le disposizioni
              inderogabili a favore del consumatore (D.Lgs. 206/2005). Per controversie online: piattaforma ODR europea.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">Art. 11 &mdash; Accettazione digitale</h2>
            <p className="text-text-muted">
              L&apos;accettazione avviene tramite selezione della casella di conferma durante la pubblicazione dell&apos;immobile.
              Vengono registrati: email verificata, indirizzo IP, data e ora (timestamp UTC), versione dei Termini.
              Tale registrazione costituisce prova ai sensi dell&apos;art. 1326 c.c. e dell&apos;art. 12 del D.Lgs. 70/2003.
            </p>

            <h2 className="text-lg font-medium text-text mt-6">Art. 12 &mdash; Approvazione specifica (artt. 1341 e 1342 c.c.)</h2>
            <p className="text-text-muted">
              Il Venditore dichiara di aver letto e di approvare specificamente le seguenti clausole:
              Art. 1 (Natura del servizio), Art. 3 (Visibilit&agrave; dati e trasmissione automatica),
              Art. 4 (Rimozione), Art. 5 e 5-bis (Obblighi e usi vietati),
              Art. 6 e 6-bis (Limitazione responsabilit&agrave; e manleva),
              Art. 7 (Propriet&agrave; intellettuale), Art. 8 (Durata e recesso),
              Art. 9 (Modifiche ai Termini), Art. 10 (Foro competente).
            </p>

            <p className="text-sm text-text-muted mt-8 pt-4 border-t border-border">
              Per informazioni: info@privatio.it
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
