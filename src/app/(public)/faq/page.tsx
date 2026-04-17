import type { Metadata } from "next";
import Link from "next/link";
import FaqAccordion from "./FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ | Privatio",
  description:
    "Tutte le risposte su Privatio: per venditori, acquirenti e agenzie. Come funziona, quanto costa, come si sceglie l'agenzia.",
};

type FaqItem = { q: string; a: string };

const venditori: FaqItem[] = [
  {
    q: "Devo pagare qualcosa per vendere?",
    a: "No, il servizio è completamente gratuito per il venditore. Né Privatio né l'agenzia convenzionata ti chiedono provvigioni. L'intero ricavato della vendita è tuo.",
  },
  {
    q: "Come scelgo l'agenzia?",
    a: "Durante il caricamento dell'immobile vedi l'elenco delle agenzie partner attive nella tua zona: sei tu a scegliere quale incaricare. Se entro 48 ore non scegli, il sistema assegna automaticamente l'agenzia meglio posizionata per la tua zona (piano, carico di lavoro, rating).",
  },
  {
    q: "Quanto tempo ci vuole a pubblicare un immobile?",
    a: "Circa 5 minuti. Indichi indirizzo, caratteristiche principali, prezzo richiesto e foto. Nessuna carta di credito richiesta.",
  },
  {
    q: "Chi gestisce visite, trattativa e rogito?",
    a: "L'agenzia partner che scegli. Si occupa di pubblicazione sui portali, visite, trattativa e accompagnamento fino al rogito. Tu incassi il 100% del prezzo concordato.",
  },
  {
    q: "Come guadagna Privatio?",
    a: "Le agenzie partner pagano un abbonamento mensile per presidiare una zona geografica. Privatio non trattiene commissioni sulle vendite e non chiede nulla ai venditori.",
  },
  {
    q: "Posso ritirare il mio annuncio?",
    a: "Sì, in qualsiasi momento dalla tua dashboard. Nessun vincolo, nessuna penale.",
  },
  {
    q: "Le agenzie partner sono affidabili?",
    a: "Sì. Ogni agenzia partner è iscritta al Registro degli Agenti, firma un contratto zero-commissioni con il venditore ed è vincolata alle condizioni di servizio di Privatio.",
  },
];

const acquirenti: FaqItem[] = [
  {
    q: "Devo pagare per usare Privatio?",
    a: "No, la piattaforma è completamente gratuita per gli acquirenti. L'unico costo possibile è la commissione dell'agenzia, concordata direttamente con loro.",
  },
  {
    q: "Quanto costa la commissione per l'acquirente?",
    a: "La commissione viene concordata direttamente tra te e l'agenzia che gestisce l'immobile. In genere si aggira tra il 2% e il 2,5% del prezzo di vendita, ma è sempre negoziabile.",
  },
  {
    q: "Come faccio a contattare l'agenzia?",
    a: "Ogni annuncio ha un modulo di contatto per richiedere informazioni o prenotare una visita. L'agenzia ti ricontatterà nel più breve tempo possibile.",
  },
  {
    q: "Gli immobili sono verificati?",
    a: "Sì. Ogni immobile è gestito da un'agenzia partner iscritta al Registro degli Agenti. L'agenzia verifica documentazione, stato dell'immobile e conformità urbanistica.",
  },
  {
    q: "Posso salvare le mie ricerche?",
    a: "Sì. Registrandoti gratuitamente puoi salvare ricerche, aggiungere immobili ai preferiti e ricevere notifiche quando nuovi immobili corrispondono ai tuoi criteri.",
  },
  {
    q: "Cosa succede se non trovo nulla di adatto?",
    a: "Puoi salvare i filtri di ricerca e attivare gli alert: ti avviseremo quando un nuovo immobile corrispondente viene pubblicato nella tua zona.",
  },
];

const agenzie: FaqItem[] = [
  {
    q: "Come funziona il modello Privatio per le agenzie?",
    a: "Privatio raccoglie venditori privati nella tua zona. Il venditore sceglie direttamente la tua agenzia durante il caricamento dell'immobile, oppure il sistema ti assegna l'incarico in base al ranking di zona. Il rapporto professionale lo gestisci in totale autonomia.",
  },
  {
    q: "Come sono suddivise le zone?",
    a: "Le zone sono basate sulle microzone OMI. Ogni metro quadrato d'Italia appartiene a una sola zona: nessuna sovrapposizione, nessun buco. Ogni zona ha un numero chiuso di agenzie partner (da 2 a 7 a seconda del tier).",
  },
  {
    q: "Quanto costa l'abbonamento?",
    a: "Il prezzo dipende dalla zona: da €99/mese per i comuni BASE fino a €2.990/mese per i centri storici PREMIUM delle grandi città. I primi 3 mesi sono gratuiti e il Prezzo Fondatore (–10%) resta bloccato per 12 mesi.",
  },
  {
    q: "Posso attivare più zone?",
    a: "Sì, fino a 3 zone contemporaneamente. Dopo la prima zona (quella della tua sede) puoi espanderti su qualsiasi zona entro 1 km dalla tua sede, di qualsiasi fascia: BASE, URBANA o PREMIUM. La fascia determina solo il prezzo mensile, non la possibilità di acquisto.",
  },
  {
    q: "Il posto è garantito?",
    a: "Il posto viene riservato in ordine di iscrizione. Ogni zona ha un numero massimo di agenzie: una volta raggiunto il limite, la zona non è più disponibile fino a eventuali disdette.",
  },
  {
    q: "Privatio è un mediatore immobiliare?",
    a: "No. Privatio è una piattaforma tecnologica di lead generation. Non svolgiamo attività di mediazione. Ti forniamo segnalazioni di potenziali clienti venditori; il rapporto contrattuale lo gestisci direttamente tu.",
  },
  {
    q: "Posso disdire l'abbonamento in qualsiasi momento?",
    a: "Sì. L'abbonamento è mensile e senza vincoli. Puoi disdire in qualsiasi momento dalla dashboard. I lead già ricevuti restano tuoi.",
  },
];

const sections = [
  { id: "venditori", title: "Per i venditori", items: venditori },
  { id: "acquirenti", title: "Per gli acquirenti", items: acquirenti },
  { id: "agenzie", title: "Per le agenzie", items: agenzie },
];

function buildJsonLd() {
  const all = [...venditori, ...acquirenti, ...agenzie];
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: all.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export default function FaqPage() {
  const jsonLd = buildJsonLd();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative mesh-navy py-24 md:py-32 overflow-hidden grain">
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <span className="eyebrow text-[#C9A84C]/80 animate-fade-in">
            Domande frequenti
          </span>
          <h1 className="mt-5 h-display text-white animate-slide-up">
            Tutte le risposte, <br className="hidden sm:block" />
            <span className="ink-gold">in un solo posto.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-white/60 sm:text-lg leading-relaxed">
            Venditori, acquirenti e agenzie: trova qui la risposta alla tua
            domanda. Se non la trovi,{" "}
            <Link
              href="/contatti"
              className="text-[#C9A84C] hover:text-[#D4B65E] transition-colors"
            >
              scrivici
            </Link>
            .
          </p>

          {/* Anchor links */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm text-white/70 transition-all hover:text-white hover:border-white/30 hover:bg-white/5"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="bg-[#F8F6F1] py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-16">
          {sections.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="font-heading text-2xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-3xl mb-6">
                {section.title}
              </h2>
              <FaqAccordion items={section.items} />
            </div>
          ))}

          <div className="text-center pt-6">
            <p className="text-base text-[#0B1D3A]/60">
              Hai altre domande?{" "}
              <Link
                href="/contatti"
                className="inline-flex items-center gap-1 font-medium text-[#C9A84C] transition-colors hover:text-[#D4B65E]"
              >
                Contattaci
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
