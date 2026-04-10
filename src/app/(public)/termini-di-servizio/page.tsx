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
          <p className="text-sm text-text-muted mb-8">Utente Venditore &mdash; Versione 1.1 &mdash; Aprile 2026</p>
          <div className="bg-white rounded-xl p-8 border border-border prose prose-slate max-w-none text-[15px]">

            {/* PREMESSE */}
            <h2 className="text-lg font-medium text-text mt-0">Premesse</h2>
            <p className="text-text-muted">
              Il presente documento disciplina i termini e le condizioni di utilizzo della piattaforma Privatio
              (di seguito &ldquo;la Piattaforma&rdquo;) da parte dell&apos;utente che intende pubblicare uno o pi&ugrave;
              immobili in vendita (di seguito &ldquo;il Venditore&rdquo;).
            </p>
            <p className="text-text-muted mt-2">
              La Piattaforma &egrave; gestita da Privatio S.r.l., con sede legale in Torino (di seguito &ldquo;Privatio&rdquo;
              o &ldquo;il Titolare&rdquo;).
            </p>
            <p className="text-text-muted mt-2">
              L&apos;accettazione dei presenti Termini avviene in forma digitale al momento della prima pubblicazione
              di un immobile sulla Piattaforma, mediante selezione dell&apos;apposita casella di conferma (checkbox).
              L&apos;accettazione &egrave; tracciata e registrata con le seguenti informazioni: indirizzo IP dell&apos;utente,
              data e ora (timestamp), indirizzo e-mail verificato.
            </p>

            {/* ART. 1 */}
            <h2 className="text-lg font-medium text-text mt-8">Art. 1 &mdash; Natura del servizio e qualificazione giuridica</h2>
            <p className="text-text-muted">
              <strong>1.1.</strong> La Piattaforma Privatio fornisce un servizio tecnologico di vetrina digitale che opera
              secondo il seguente meccanismo:
            </p>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>il Venditore carica le informazioni generali del proprio immobile sulla Piattaforma;</li>
              <li>la Piattaforma mostra al Venditore l&apos;elenco delle agenzie immobiliari convenzionate e operanti nella zona geografica dell&apos;immobile;</li>
              <li>il Venditore pu&ograve; consultare i profili delle agenzie convenzionate e contattare direttamente quelle di suo interesse;</li>
              <li>solo nel caso in cui il Venditore non contatti alcuna agenzia entro 48 ore dalla pubblicazione dell&apos;immobile, i suoi dati di contatto e le informazioni sull&apos;immobile saranno trasmessi alle agenzie convenzionate nella zona, le quali potranno contattare il Venditore.</li>
            </ul>

            <p className="text-text-muted mt-3">
              <strong>1.2.</strong> Privatio <strong>NON &egrave; un&apos;agenzia immobiliare</strong> e non svolge attivit&agrave;
              di mediazione immobiliare ai sensi dell&apos;art. 1754 del Codice Civile e della Legge 3 febbraio 1989, n. 39
              e successive modifiche. In particolare, Privatio:
            </p>
            <ol className="text-text-muted list-[lower-alpha] pl-6 space-y-1">
              <li>non mette in relazione le parti per la conclusione di un affare ai sensi dell&apos;art. 1754 c.c.;</li>
              <li>non partecipa in alcun modo alla trattativa tra Venditore e agenzia immobiliare;</li>
              <li>non ha alcun potere di rappresentanza del Venditore;</li>
              <li>non determina n&eacute; influenza le condizioni della compravendita;</li>
              <li>non percepisce provvigioni, compensi o commissioni commisurati al valore della compravendita degli immobili;</li>
              <li>non &egrave; iscritta al Registro degli Agenti di Affari in Mediazione presso la Camera di Commercio.</li>
            </ol>

            <p className="text-text-muted mt-3">
              <strong>1.3.</strong> Il servizio di pubblicazione dell&apos;immobile sulla Piattaforma &egrave; gratuito per il Venditore,
              salvo diversa indicazione comunicata preventivamente.
            </p>
            <p className="text-text-muted mt-2">
              <strong>1.4.</strong> La Piattaforma non fornisce valutazioni, stime, perizie o pareri sul valore degli immobili.
              Eventuali indicazioni di prezzo presenti sulla Piattaforma sono esclusivamente quelle inserite dal Venditore sotto
              la propria responsabilit&agrave; e non costituiscono in alcun modo una valutazione, una stima o un suggerimento da parte di Privatio.
            </p>
            <p className="text-text-muted mt-2">
              <strong>1.5.</strong> Il modello di business di Privatio si basa esclusivamente su servizi tecnologici forniti alle
              agenzie immobiliari convenzionate (abbonamenti, servizi premium) e non su compensi legati alla conclusione di compravendite immobiliari.
            </p>

            {/* ART. 2 */}
            <h2 className="text-lg font-medium text-text mt-8">Art. 2 &mdash; Registrazione e pubblicazione</h2>
            <p className="text-text-muted">
              <strong>2.1.</strong> Per pubblicare un immobile, il Venditore deve:
            </p>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>creare un account sulla Piattaforma fornendo un indirizzo e-mail valido e verificato;</li>
              <li>compilare la scheda immobiliare con i dati richiesti (indirizzo, caratteristiche, prezzo indicativo, eventuali fotografie);</li>
              <li>accettare i presenti Termini e la Privacy Policy mediante selezione della casella di conferma.</li>
            </ul>
            <p className="text-text-muted mt-2">
              <strong>2.2.</strong> Il Venditore dichiara e garantisce che le informazioni fornite sono veritiere, accurate e aggiornate,
              e che &egrave; legittimamente autorizzato a disporre dell&apos;immobile pubblicato (in qualit&agrave; di proprietario,
              comproprietario con il consenso degli altri comproprietari, o soggetto munito di procura).
            </p>
            <p className="text-text-muted mt-2">
              <strong>2.3.</strong> Privatio si riserva il diritto di verificare la veridicit&agrave; delle informazioni fornite
              e di rimuovere o sospendere annunci che risultino falsi, fuorvianti o in violazione dei presenti Termini.
            </p>

            {/* ART. 3 */}
            <h2 className="text-lg font-medium text-text mt-8">Art. 3 &mdash; Visibilit&agrave; dei dati del Venditore</h2>
            <p className="text-text-muted">
              <strong>3.1.</strong> La comunicazione dei dati del Venditore alle agenzie immobiliari avviene secondo un meccanismo a due fasi:
            </p>
            <div className="bg-bg-soft rounded-lg p-4 my-3">
              <p className="text-text-muted">
                <strong>Fase 1 &mdash; Contatto attivo del Venditore (prime 48 ore):</strong><br />
                Dopo la pubblicazione dell&apos;immobile, il Venditore visualizza l&apos;elenco delle agenzie convenzionate nella zona
                e pu&ograve; contattarle direttamente tramite la Piattaforma. In questa fase, i dati di contatto del Venditore
                NON sono comunicati ad alcuna agenzia; sono le informazioni generali dell&apos;immobile (senza dati identificativi
                del Venditore) ad essere visibili nel profilo pubblicato.
              </p>
            </div>
            <div className="bg-bg-soft rounded-lg p-4 my-3">
              <p className="text-text-muted">
                <strong>Fase 2 &mdash; Invio automatico (dopo 48 ore senza contatto):</strong><br />
                Qualora il Venditore non contatti alcuna agenzia entro 48 ore dalla pubblicazione, i suoi dati di contatto
                e le informazioni sull&apos;immobile saranno automaticamente trasmessi alle agenzie convenzionate operanti nella
                zona geografica dell&apos;immobile, le quali potranno contattare il Venditore.
              </p>
            </div>
            <p className="text-text-muted mt-2">
              <strong>3.1-bis.</strong> La trasmissione automatica dei dati di cui alla Fase 2 &egrave; subordinata al consenso
              esplicito e specifico del Venditore, espresso mediante apposita casella di conferma separata al momento della
              pubblicazione dell&apos;immobile. Il Venditore pu&ograve; in qualsiasi momento revocare tale consenso tramite le
              impostazioni del proprio pannello di controllo.
            </p>
            <p className="text-text-muted mt-2">
              <strong>3.2.</strong> Il Venditore pu&ograve; in qualsiasi momento disattivare la trasmissione automatica dei propri
              dati alle agenzie (Fase 2) tramite le impostazioni del proprio pannello di controllo.
            </p>
            <p className="text-text-muted mt-2">
              <strong>3.3.</strong> I dati del Venditore NON saranno pubblicati su siti web pubblici, motori di ricerca o piattaforme
              di annunci aperti al pubblico generico.
            </p>
            <p className="text-text-muted mt-2">
              <strong>3.4.</strong> Le agenzie immobiliari che accedono ai dati del Venditore sono a loro volta vincolate da specifici
              obblighi contrattuali di riservatezza e di utilizzo conforme alle finalit&agrave; della Piattaforma.
            </p>

            {/* ART. 3-bis: RANKING TRANSPARENCY (Reg. UE 2019/1150, Art. 5) */}
            <h2 className="text-lg font-medium text-text mt-8">Art. 3-bis &mdash; Criteri di classificazione delle agenzie</h2>
            <p className="text-text-muted">
              <strong>3-bis.1.</strong> Le agenzie partner vengono presentate al Venditore nella propria zona secondo i seguenti criteri,
              in ordine di priorit&agrave;: (a) piano di abbonamento sottoscritto dall&apos;agenzia; (b) carico di lavoro corrente
              (vengono favorite le agenzie con meno incarichi attivi); (c) valutazione media degli utenti.
            </p>
            <p className="text-text-muted mt-2">
              <strong>3-bis.2.</strong> Nessun pagamento diretto influenza il posizionamento delle agenzie oltre il piano di abbonamento
              sottoscritto. Non esistono inserzioni a pagamento, risultati sponsorizzati o trattamenti preferenziali non trasparenti.
            </p>
            <p className="text-text-muted mt-2">
              <strong>3-bis.3.</strong> La presente informativa &egrave; fornita ai sensi dell&apos;Art. 5 del Regolamento UE 2019/1150
              relativo alla promozione di equit&agrave; e trasparenza per gli utenti commerciali dei servizi di intermediazione online.
            </p>

            {/* ART. 4 */}
            <h2 className="text-lg font-medium text-text mt-8">Art. 4 &mdash; Diritto di rimozione</h2>
            <p className="text-text-muted">
              <strong>4.1.</strong> Il Venditore ha il diritto di rimuovere il proprio immobile dalla Piattaforma in qualsiasi momento,
              senza preavviso, senza penali e senza dover fornire alcuna motivazione.
            </p>
            <p className="text-text-muted mt-2">
              <strong>4.2.</strong> La rimozione dell&apos;immobile pu&ograve; essere effettuata direttamente dal Venditore tramite
              il proprio pannello di controllo, oppure inviando richiesta all&apos;indirizzo e-mail info@privatio.it.
            </p>
            <p className="text-text-muted mt-2">
              <strong>4.3.</strong> A seguito della rimozione, i dati dell&apos;immobile e del Venditore cessano di essere visibili
              alle agenzie immobiliari entro 24 ore dalla richiesta. I dati saranno cancellati dai sistemi entro 30 giorni, fatti
              salvi gli obblighi di legge relativi alla conservazione dei dati.
            </p>

            {/* ART. 5 */}
            <h2 className="text-lg font-medium text-text mt-8">Art. 5 &mdash; Obblighi del Venditore</h2>
            <p className="text-text-muted">
              <strong>5.1.</strong> Il Venditore si impegna a:
            </p>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>fornire informazioni veritiere e aggiornate sull&apos;immobile pubblicato;</li>
              <li>aggiornare tempestivamente la scheda immobiliare in caso di variazioni significative (prezzo, disponibilit&agrave;, caratteristiche);</li>
              <li>rimuovere l&apos;annuncio qualora l&apos;immobile non sia pi&ugrave; disponibile per la vendita;</li>
              <li>non utilizzare la Piattaforma per finalit&agrave; illecite, fraudolente o comunque contrarie all&apos;ordine pubblico e al buon costume;</li>
              <li>non pubblicare contenuti offensivi, discriminatori o lesivi dei diritti di terzi.</li>
            </ul>
            <p className="text-text-muted mt-2">
              <strong>5.2.</strong> Il Venditore &egrave; l&apos;unico responsabile della veridicit&agrave; e della legalit&agrave;
              delle informazioni pubblicate. Privatio non risponde per danni derivanti da informazioni false o fuorvianti fornite dal Venditore.
            </p>
            <p className="text-text-muted mt-2">
              <strong>5.3.</strong> In caso di violazione degli obblighi di cui al presente articolo, Privatio si riserva il diritto
              di adottare, a propria discrezione e in relazione alla gravit&agrave; della violazione, una o pi&ugrave; delle seguenti misure:
            </p>
            <ol className="text-text-muted list-[lower-alpha] pl-6 space-y-1">
              <li>richiedere al Venditore la correzione delle informazioni entro un termine ragionevole non inferiore a 5 giorni lavorativi;</li>
              <li>sospendere temporaneamente la visibilit&agrave; dell&apos;annuncio fino alla regolarizzazione;</li>
              <li>rimuovere l&apos;annuncio dalla Piattaforma;</li>
              <li>sospendere o chiudere l&apos;account del Venditore ai sensi dell&apos;Art. 8.3.</li>
            </ol>

            {/* ART. 5-bis */}
            <h2 className="text-lg font-medium text-text mt-8">Art. 5-bis &mdash; Usi vietati della Piattaforma</h2>
            <p className="text-text-muted">
              <strong>5-bis.1.</strong> &Egrave; espressamente vietato al Venditore:
            </p>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>pubblicare immobili inesistenti, non realmente disponibili per la vendita o di cui non si ha la legittima disponibilit&agrave;;</li>
              <li>utilizzare la Piattaforma allo scopo di raccogliere dati, informazioni o contatti delle agenzie immobiliari convenzionate per finalit&agrave; diverse da quelle previste dal presente contratto;</li>
              <li>effettuare attivit&agrave; di scraping, data mining, estrazione automatizzata di dati o reverse engineering della Piattaforma;</li>
              <li>utilizzare bot, script, strumenti automatizzati o qualsiasi mezzo non autorizzato per interagire con la Piattaforma;</li>
              <li>contattare le agenzie convenzionate al di fuori della Piattaforma utilizzando dati ottenuti tramite essa, salvo che il contatto sia avvenuto tramite la funzionalit&agrave; prevista dalla Piattaforma;</li>
              <li>pubblicare lo stesso immobile con pi&ugrave; account diversi;</li>
              <li>utilizzare la Piattaforma per svolgere attivit&agrave; di mediazione immobiliare, anche occasionale, ai sensi della L. 39/1989.</li>
            </ul>
            <p className="text-text-muted mt-2">
              <strong>5-bis.2.</strong> La violazione dei divieti di cui al presente articolo costituisce grave inadempimento e legittima
              Privatio alla sospensione immediata dell&apos;account senza preavviso, fatta salva ogni ulteriore azione per il risarcimento dei danni.
            </p>

            {/* ART. 6 */}
            <h2 className="text-lg font-medium text-text mt-8">Art. 6 &mdash; Limitazione di responsabilit&agrave;</h2>
            <p className="text-text-muted">
              <strong>6.1.</strong> Privatio non garantisce la conclusione di trattative o compravendite a seguito della pubblicazione
              dell&apos;immobile sulla Piattaforma.
            </p>
            <p className="text-text-muted mt-2">
              <strong>6.2.</strong> Privatio non &egrave; responsabile per:
            </p>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>il comportamento delle agenzie immobiliari che accedono ai dati del Venditore;</li>
              <li>la mancata conclusione o il fallimento di trattative tra Venditore e agenzie;</li>
              <li>eventuali interruzioni o malfunzionamenti temporanei della Piattaforma;</li>
              <li>danni diretti o indiretti derivanti dall&apos;utilizzo della Piattaforma, salvo i casi di dolo o colpa grave.</li>
            </ul>
            <p className="text-text-muted mt-2">
              <strong>6.3.</strong> Le agenzie immobiliari convenzionate sono soggetti giuridici indipendenti e autonomi. Privatio non
              controlla, supervisiona n&eacute; garantisce la qualit&agrave;, la correttezza, la professionalit&agrave; o la conformit&agrave;
              normativa del servizio reso dalle agenzie al Venditore. Il rapporto tra Venditore e agenzia immobiliare &egrave; regolato
              esclusivamente dagli accordi stipulati direttamente tra le parti. Privatio &egrave; del tutto estranea a tale rapporto
              e non assume alcuna responsabilit&agrave; in merito.
            </p>
            <p className="text-text-muted mt-2">
              <strong>6.4.</strong> Privatio si impegna a garantire il corretto funzionamento della Piattaforma con la diligenza del
              buon padre di famiglia e ad adottare adeguate misure di sicurezza per la protezione dei dati personali.
            </p>
            <p className="text-text-muted mt-2">
              <strong>6.5.</strong> In ogni caso, la responsabilit&agrave; complessiva di Privatio nei confronti del Venditore, per
              qualsiasi causa e a qualsiasi titolo, non potr&agrave; eccedere l&apos;importo complessivo dei corrispettivi
              eventualmente versati dal Venditore a Privatio nei 12 (dodici) mesi precedenti l&apos;evento dannoso, ovvero, qualora
              il servizio sia gratuito, la somma di EUR 100,00 (cento/00). Sono esclusi dalla presente limitazione i soli casi di dolo.
            </p>

            {/* ART. 6-bis */}
            <h2 className="text-lg font-medium text-text mt-8">Art. 6-bis &mdash; Manleva e indennit&agrave;</h2>
            <p className="text-text-muted">
              <strong>6-bis.1.</strong> Il Venditore si impegna a manlevare e tenere indenne Privatio, i suoi amministratori, dipendenti,
              collaboratori e aventi causa da qualsiasi pretesa, azione, danno, costo, spesa o responsabilit&agrave; (incluse le ragionevoli
              spese legali e di consulenza) derivanti da o connessi a:
            </p>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>informazioni false, inesatte, fuorvianti o incomplete fornite dal Venditore sulla Piattaforma;</li>
              <li>violazione dei presenti Termini e Condizioni da parte del Venditore;</li>
              <li>violazione di diritti di propriet&agrave; intellettuale, diritti di immagine o altri diritti di terzi da parte del Venditore;</li>
              <li>pubblicazione di immobili senza la necessaria legittimazione o autorizzazione;</li>
              <li>qualsiasi controversia, pretesa o reclamo tra il Venditore e le agenzie immobiliari contattate tramite la Piattaforma, ivi incluse eventuali controversie relative alla compravendita dell&apos;immobile o all&apos;operato dell&apos;agenzia.</li>
            </ul>
            <p className="text-text-muted mt-2">
              <strong>6-bis.2.</strong> Il Venditore riconosce e accetta che Privatio non &egrave; parte delle trattative tra Venditore
              e agenzie immobiliari e che qualsiasi controversia relativa alla compravendita dell&apos;immobile, alle condizioni economiche,
              alle provvigioni dell&apos;agenzia o a qualsivoglia aspetto del rapporto Venditore-agenzia &egrave; del tutto estranea al
              rapporto contrattuale con Privatio.
            </p>
            <p className="text-text-muted mt-2">
              <strong>6-bis.3.</strong> L&apos;obbligo di manleva di cui al presente articolo sopravvive alla cessazione del rapporto
              contrattuale tra il Venditore e Privatio per un periodo di 24 (ventiquattro) mesi.
            </p>

            {/* ART. 7 */}
            <h2 className="text-lg font-medium text-text mt-8">Art. 7 &mdash; Propriet&agrave; intellettuale</h2>
            <p className="text-text-muted">
              <strong>7.1.</strong> Il Venditore mantiene la piena propriet&agrave; di tutti i contenuti (testi, fotografie, planimetrie) caricati sulla Piattaforma.
            </p>
            <p className="text-text-muted mt-2">
              <strong>7.2.</strong> Con la pubblicazione dell&apos;immobile, il Venditore concede a Privatio una licenza non esclusiva,
              gratuita, limitata e revocabile per:
            </p>
            <ol className="text-text-muted list-[lower-alpha] pl-6 space-y-1">
              <li>mostrare tali contenuti alle agenzie immobiliari convenzionate, per la sola finalit&agrave; del servizio;</li>
              <li>creare copie tecniche, cache, miniature (thumbnail) e backup necessari al funzionamento della Piattaforma;</li>
              <li>produrre statistiche aggregate e anonimizzate sull&apos;utilizzo del servizio.</li>
            </ol>
            <p className="text-text-muted mt-2">
              Tale licenza si estingue automaticamente con la rimozione dell&apos;annuncio, fatta salva la conservazione tecnica prevista dall&apos;Art. 4.3.
            </p>
            <p className="text-text-muted mt-2">
              <strong>7.3.</strong> Il Venditore dichiara e garantisce di essere titolare di tutti i diritti sui contenuti caricati
              (testi, fotografie, planimetrie) e di non violare diritti di propriet&agrave; intellettuale, diritti di immagine o altri
              diritti di terzi. In caso di violazione, si applica la manleva di cui all&apos;Art. 6-bis.
            </p>

            {/* ART. 8 */}
            <h2 className="text-lg font-medium text-text mt-8">Art. 8 &mdash; Durata e recesso</h2>
            <p className="text-text-muted">
              <strong>8.1.</strong> Il rapporto contrattuale ha durata indeterminata e decorre dal momento dell&apos;accettazione dei presenti Termini.
            </p>
            <p className="text-text-muted mt-2">
              <strong>8.2.</strong> Il Venditore pu&ograve; recedere in qualsiasi momento cancellando il proprio account o rimuovendo tutti gli immobili pubblicati.
            </p>
            <p className="text-text-muted mt-2">
              <strong>8.3.</strong> Privatio si riserva il diritto di sospendere o chiudere l&apos;account del Venditore in caso di
              violazione dei presenti Termini, previa comunicazione via e-mail con un preavviso di almeno 15 giorni, salvo i casi
              di gravi violazioni che richiedano la sospensione immediata.
            </p>
            <p className="text-text-muted mt-2">
              <strong>8.4.</strong> <em>(Diritto di appello &mdash; Art. 4 Reg. UE 2019/1150)</em> Prima dell&apos;applicazione di qualsiasi
              misura restrittiva (sospensione, limitazione di visibilit&agrave;, chiusura dell&apos;account), Privatio comunicher&agrave;
              le motivazioni specifiche via e-mail. Il Venditore dispone di 10 (dieci) giorni per presentare controdeduzioni scritte
              all&apos;indirizzo reclami@privatio.it. La misura non sar&agrave; applicata prima della scadenza di tale termine,
              fatti salvi i casi di obbligo di legge o gravi violazioni che comportino un rischio immediato per la sicurezza della Piattaforma.
            </p>
            <p className="text-text-muted mt-2">
              <strong>8.5.</strong> Per qualsiasi contestazione relativa a sospensioni, limitazioni o chiusure dell&apos;account, il Venditore pu&ograve;
              utilizzare la procedura interna di reclamo disponibile alla pagina{" "}
              <a href="/reclami" className="text-primary hover:underline font-medium">Reclami</a>.
            </p>

            {/* ART. 9 */}
            <h2 className="text-lg font-medium text-text mt-8">Art. 9 &mdash; Modifiche ai Termini</h2>
            <p className="text-text-muted">
              <strong>9.1.</strong> Privatio si riserva il diritto di modificare i presenti Termini in qualsiasi momento. Le modifiche
              sostanziali (che incidano su diritti, obblighi o responsabilit&agrave; del Venditore) saranno comunicate via e-mail
              almeno 30 giorni prima della loro entrata in vigore. Le modifiche formali o di carattere tecnico-organizzativo, che non
              incidano sui diritti del Venditore, potranno essere comunicate con un preavviso di 15 giorni.
            </p>
            <p className="text-text-muted mt-2">
              <strong>9.2.</strong> L&apos;utilizzo continuato della Piattaforma dopo l&apos;entrata in vigore delle modifiche costituisce
              accettazione dei nuovi Termini. Il Venditore che non intenda accettare le modifiche potr&agrave; recedere secondo le
              modalit&agrave; previste dall&apos;Art. 8.
            </p>

            {/* ART. 9-bis: FORZA MAGGIORE */}
            <h2 className="text-lg font-medium text-text mt-8">Art. 9-bis &mdash; Forza maggiore</h2>
            <p className="text-text-muted">
              <strong>9-bis.1.</strong> Privatio non sar&agrave; responsabile per ritardi, interruzioni o inadempimenti
              nell&apos;erogazione del servizio causati da eventi di forza maggiore, intesi come eventi imprevedibili,
              inevitabili e al di fuori del ragionevole controllo di Privatio, ivi inclusi a titolo esemplificativo:
              calamit&agrave; naturali, pandemie, atti di guerra o terrorismo, provvedimenti delle autorit&agrave;,
              interruzioni prolungate della fornitura di energia elettrica o delle reti di telecomunicazione,
              cyberattacchi su larga scala, guasti dei fornitori di servizi cloud.
            </p>
            <p className="text-text-muted mt-2">
              <strong>9-bis.2.</strong> In caso di evento di forza maggiore, Privatio ne dar&agrave; comunicazione tempestiva
              ai Venditori tramite e-mail o avviso sulla Piattaforma, indicando la durata prevista dell&apos;interruzione.
              Se l&apos;evento si protrae per oltre 30 (trenta) giorni consecutivi, ciascuna parte potr&agrave; recedere
              dal rapporto senza responsabilit&agrave;.
            </p>

            {/* DISPOSIZIONI FINALI */}
            <h2 className="text-lg font-medium text-text mt-8 pt-4 border-t border-border">Disposizioni Finali</h2>

            {/* ART. 10 */}
            <h2 className="text-lg font-medium text-text mt-6">Art. 10 &mdash; Legge applicabile e foro competente</h2>
            <p className="text-text-muted">
              <strong>10.1.</strong> I presenti Termini sono regolati dalla legge italiana.
            </p>
            <p className="text-text-muted mt-2">
              <strong>10.2.</strong> Per qualsiasi controversia derivante dall&apos;interpretazione o dall&apos;esecuzione dei presenti
              Termini, le parti si impegnano a esperire preventivamente un tentativo di mediazione ai sensi del D.Lgs. 4 marzo 2010,
              n. 28 e successive modifiche, presso un organismo di mediazione accreditato dal Ministero della Giustizia, con sede nel
              circondario del Foro di Torino. La procedura di mediazione dovr&agrave; concludersi entro 60 (sessanta) giorni dal deposito
              dell&apos;istanza. In caso di mancato accordo in sede di mediazione, sar&agrave; competente il Foro di Torino, fatte salve
              le disposizioni inderogabili in materia di competenza a favore del consumatore ai sensi del D.Lgs. 206/2005 (Codice del Consumo).
            </p>
            <p className="text-text-muted mt-2">
              <strong>10.3.</strong> Per le controversie relative a contratti conclusi online, il Venditore consumatore pu&ograve; inoltre
              accedere alla piattaforma europea di Risoluzione delle Controversie Online (ODR) all&apos;indirizzo{" "}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                https://ec.europa.eu/consumers/odr
              </a>.
            </p>

            {/* ART. 11 */}
            <h2 className="text-lg font-medium text-text mt-8">Art. 11 &mdash; Modalit&agrave; di accettazione digitale</h2>
            <p className="text-text-muted">
              <strong>11.1.</strong> L&apos;accettazione dei presenti Termini e della Privacy Policy avviene in modalit&agrave; digitale
              al momento della prima pubblicazione di un immobile sulla Piattaforma.
            </p>
            <p className="text-text-muted mt-2">
              <strong>11.2.</strong> Il Venditore dichiara di aver letto, compreso e accettato integralmente i presenti Termini e Condizioni
              di Servizio e l&apos;Informativa sulla Privacy mediante la selezione dell&apos;apposita casella di conferma (checkbox).
            </p>
            <p className="text-text-muted mt-2">
              <strong>11.3.</strong> L&apos;accettazione &egrave; registrata dal sistema con i seguenti elementi probatori:
            </p>
            <ul className="text-text-muted list-disc pl-6 space-y-1">
              <li>indirizzo e-mail verificato del Venditore;</li>
              <li>indirizzo IP del dispositivo utilizzato;</li>
              <li>data e ora esatte dell&apos;accettazione (timestamp UTC);</li>
              <li>versione dei Termini accettati.</li>
            </ul>
            <p className="text-text-muted mt-2">
              <strong>11.4.</strong> Tale registrazione costituisce prova sufficiente dell&apos;avvenuta accettazione ai sensi dell&apos;art. 1326
              del Codice Civile e dell&apos;art. 12 del D.Lgs. 70/2003 (Decreto sul Commercio Elettronico).
            </p>

            {/* ART. 12 */}
            <h2 className="text-lg font-medium text-text mt-8">Art. 12 &mdash; Approvazione specifica (artt. 1341 e 1342 c.c.)</h2>
            <p className="text-text-muted">
              Ai sensi e per gli effetti degli articoli 1341 e 1342 del Codice Civile, il Venditore dichiara di aver letto e di approvare
              specificamente le seguenti clausole:
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-3">
              <p className="text-text-muted text-sm">
                <strong>Art. 1</strong> (Natura del servizio e qualificazione giuridica &mdash; Privatio non &egrave; un&apos;agenzia immobiliare,
                meccanismo a due fasi, assenza di valutazioni immobiliari); <strong>Art. 3</strong> (Visibilit&agrave; dei dati e trasmissione
                automatica dopo 48 ore); <strong>Art. 4</strong> (Diritto di rimozione); <strong>Art. 5</strong> (Obblighi del Venditore e sanzioni);
                {" "}<strong>Art. 5-bis</strong> (Usi vietati della Piattaforma); <strong>Art. 6</strong> (Limitazione di responsabilit&agrave;
                e tetto quantitativo); <strong>Art. 6-bis</strong> (Manleva e indennit&agrave;); <strong>Art. 7</strong> (Propriet&agrave;
                intellettuale e licenza); <strong>Art. 8</strong> (Durata e recesso); <strong>Art. 9</strong> (Modifiche ai Termini);
                {" "}<strong>Art. 9-bis</strong> (Forza maggiore); <strong>Art. 10</strong> (Legge applicabile, mediazione obbligatoria e foro competente).
              </p>
            </div>

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
