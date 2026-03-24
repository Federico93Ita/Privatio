import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Per Acquirenti — Come funziona Privatio",
  description:
    "Scopri come trovare il tuo immobile ideale su Privatio. Immobili verificati, agenzie professionali e trasparenza totale.",
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    num: "01",
    title: "Cerca il tuo immobile",
    desc: "Sfoglia gli annunci disponibili, filtra per città, prezzo, superficie e tipologia. Tutti gli immobili sono verificati.",
  },
  {
    num: "02",
    title: "Contatta l'agenzia",
    desc: "Ogni immobile è gestito da un'agenzia partner selezionata. Richiedi informazioni o prenota una visita direttamente dalla piattaforma.",
  },
  {
    num: "03",
    title: "Visita e valuta",
    desc: "L'agenzia organizza la visita e ti accompagna in ogni fase: dalla prima visita alla trattativa, fino alla proposta d'acquisto.",
  },
  {
    num: "04",
    title: "Acquista in sicurezza",
    desc: "L'agenzia verifica la documentazione, ti assiste con il notaio e gestisce tutto fino al rogito. Nessuna sorpresa.",
  },
];

const BENEFITS = [
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Immobili verificati",
    desc: "Ogni annuncio è verificato dall'agenzia partner: documentazione, foto reali e informazioni accurate.",
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    title: "Agenzie selezionate",
    desc: "Collaboriamo solo con agenzie iscritte al Registro, con polizza RC e impegno alla trasparenza.",
  },
  {
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Commissioni trasparenti",
    desc: "L'eventuale commissione acquirente (2-2,5%) viene concordata direttamente con l'agenzia, senza sorprese.",
  },
  {
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    title: "Zero commissioni al venditore",
    desc: "Su Privatio il venditore non paga nulla. Le commissioni sono solo a carico dell'acquirente.",
  },
  {
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    title: "Documentazione completa",
    desc: "L'agenzia verifica tutta la documentazione prima della vendita: visura, APE, conformità urbanistica e catastale.",
  },
  {
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    title: "Supporto diretto",
    desc: "Comunica con l'agenzia direttamente dalla piattaforma. Nessun intermediario tra te e chi gestisce l'immobile.",
  },
];

const FAQ = [
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
    q: "Cosa succede se non mi piace nessun immobile?",
    a: "Puoi salvare i filtri di ricerca e attivare gli alert: ti avviseremo quando un nuovo immobile corrispondente viene pubblicato nella tua zona.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PerAcquirentiPage() {
  return (
    <>
      <Header />
      <main>
        {/* ── Hero ── */}
        <section className="bg-gradient-to-b from-primary-dark to-primary-dark/95 text-white py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-light tracking-[-0.03em] mb-6">
              Trova la casa dei tuoi sogni
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
              Immobili verificati, agenzie professionali selezionate e zero commissioni per il venditore. Tu scegli, noi ti guidiamo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cerca"
                className="px-8 py-4 bg-white text-primary-dark rounded-xl text-lg font-semibold hover:bg-white/90 transition-colors"
              >
                Cerca immobili
              </Link>
              <Link
                href="/registrati"
                className="px-8 py-4 border-2 border-white/30 text-white rounded-xl text-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Registrati gratis
              </Link>
            </div>
          </div>
        </section>

        {/* ── Come funziona ── */}
        <section className="py-16 md:py-24 bg-bg-soft">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-light tracking-[-0.03em] text-primary-dark text-center mb-4">
              Come funziona per te
            </h2>
            <p className="text-text-muted text-center max-w-xl mx-auto mb-14">
              Dall&apos;annuncio al rogito in 4 semplici passi.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {STEPS.map((step) => (
                <div key={step.num} className="relative">
                  <span className="text-5xl font-extralight text-primary/15">{step.num}</span>
                  <h3 className="text-lg font-medium text-text mt-2 mb-2">{step.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Vantaggi ── */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-light tracking-[-0.03em] text-primary-dark text-center mb-4">
              Perché scegliere Privatio
            </h2>
            <p className="text-text-muted text-center max-w-xl mx-auto mb-14">
              I vantaggi concreti per chi cerca casa.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="bg-white rounded-xl p-6 border border-border hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-text mb-2">{b.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Commissioni chiare ── */}
        <section className="py-16 md:py-20 bg-primary/5">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-light tracking-[-0.03em] text-primary-dark mb-6">
              Chi paga cosa?
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 mt-10">
              <div className="bg-white rounded-xl p-6 border border-border">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-success">0%</span>
                </div>
                <h3 className="font-medium text-text mb-2">Venditore</h3>
                <p className="text-sm text-text-muted">
                  Il venditore non paga nessuna commissione. Questo è il cuore di Privatio.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-primary">2-2,5%</span>
                </div>
                <h3 className="font-medium text-text mb-2">Acquirente</h3>
                <p className="text-sm text-text-muted">
                  Commissione negoziata direttamente con l&apos;agenzia. Nessun costo nascosto, totale trasparenza.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-light tracking-[-0.03em] text-primary-dark text-center mb-14">
              Domande frequenti
            </h2>
            <div className="space-y-4">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group bg-white rounded-xl border border-border overflow-hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-text font-medium hover:bg-bg-soft/50 transition-colors">
                    {item.q}
                    <svg
                      className="w-5 h-5 text-text-muted flex-shrink-0 ml-4 transition-transform group-open:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="px-6 pb-4 text-sm text-text-muted leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA finale ── */}
        <section className="py-16 md:py-20 bg-primary-dark text-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-light tracking-[-0.03em] mb-4">
              Pronto a trovare la tua casa?
            </h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto">
              Registrati gratuitamente per salvare ricerche, aggiungere preferiti e ricevere alert sui nuovi immobili.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cerca"
                className="px-8 py-4 bg-white text-primary-dark rounded-xl text-lg font-semibold hover:bg-white/90 transition-colors"
              >
                Cerca immobili
              </Link>
              <Link
                href="/registrati"
                className="px-8 py-4 border-2 border-white/30 text-white rounded-xl text-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Crea account gratuito
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
