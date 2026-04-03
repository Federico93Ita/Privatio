import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Per Acquirenti — Come funziona Privatio",
  description:
    "Scopri come trovare il tuo immobile ideale su Privatio. Immobili verificati, agenzie professionali e trasparenza totale.",
};

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
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
    title: "Immobili verificati",
    desc: "Ogni annuncio è verificato dall'agenzia partner: documentazione, foto reali e informazioni accurate.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    title: "Agenzie selezionate",
    desc: "Collaboriamo solo con agenzie iscritte al Registro, con polizza RC e impegno alla trasparenza.",
    color: "bg-[#C9A84C]/10 text-[#C9A84C]",
  },
  {
    icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Commissioni trasparenti",
    desc: "L'eventuale commissione acquirente (2-2,5%) viene concordata direttamente con l'agenzia, senza sorprese.",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: "M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
    title: "Zero commissioni al venditore",
    desc: "Su Privatio il venditore non paga nulla. Le commissioni sono solo a carico dell'acquirente.",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    title: "Documentazione completa",
    desc: "L'agenzia verifica tutta la documentazione prima della vendita: visura, APE, conformità urbanistica e catastale.",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
    title: "Supporto diretto",
    desc: "Comunica con l'agenzia direttamente dalla piattaforma. Nessun intermediario tra te e chi gestisce l'immobile.",
    color: "bg-cyan-500/10 text-cyan-600",
  },
];

const FAQ = [
  { q: "Devo pagare per usare Privatio?", a: "No, la piattaforma è completamente gratuita per gli acquirenti. L'unico costo possibile è la commissione dell'agenzia, concordata direttamente con loro." },
  { q: "Quanto costa la commissione per l'acquirente?", a: "La commissione viene concordata direttamente tra te e l'agenzia che gestisce l'immobile. In genere si aggira tra il 2% e il 2,5% del prezzo di vendita, ma è sempre negoziabile." },
  { q: "Come faccio a contattare l'agenzia?", a: "Ogni annuncio ha un modulo di contatto per richiedere informazioni o prenotare una visita. L'agenzia ti ricontatterà nel più breve tempo possibile." },
  { q: "Gli immobili sono verificati?", a: "Sì. Ogni immobile è gestito da un'agenzia partner iscritta al Registro degli Agenti. L'agenzia verifica documentazione, stato dell'immobile e conformità urbanistica." },
  { q: "Posso salvare le mie ricerche?", a: "Sì. Registrandoti gratuitamente puoi salvare ricerche, aggiungere immobili ai preferiti e ricevere notifiche quando nuovi immobili corrispondono ai tuoi criteri." },
  { q: "Cosa succede se non mi piace nessun immobile?", a: "Puoi salvare i filtri di ricerca e attivare gli alert: ti avviseremo quando un nuovo immobile corrispondente viene pubblicato nella tua zona." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Devo pagare per usare Privatio come acquirente?", acceptedAnswer: { "@type": "Answer", text: "No, la piattaforma è gratuita per gli acquirenti. Puoi cercare immobili, salvare preferiti e contattare le agenzie senza alcun costo." } },
    { "@type": "Question", name: "Quanto costa la commissione per l'acquirente?", acceptedAnswer: { "@type": "Answer", text: "La commissione acquirente è del 2-2,5%, negoziata direttamente con l'agenzia partner. Nessun costo nascosto." } },
    { "@type": "Question", name: "Gli immobili su Privatio sono verificati?", acceptedAnswer: { "@type": "Answer", text: "Sì, ogni immobile è gestito da agenzie iscritte al Registro Imprese con polizza RC professionale." } },
  ],
};

export default function PerAcquirentiPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative bg-[#0B1D3A] pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden grain">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C9A84C]/[0.05] blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-blue-500/[0.03] blur-[80px]" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8F6F1] to-transparent" />

          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C]/70 mb-5">Per gli acquirenti</span>
            <h1 className="font-heading text-4xl font-normal tracking-[-0.02em] text-white md:text-6xl mb-6">
              Trova la casa dei tuoi sogni
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed md:text-xl mb-10">
              Immobili verificati, agenzie professionali selezionate e zero commissioni per il venditore. Tu scegli, noi ti guidiamo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cerca"
                className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] px-8 py-4 text-base font-medium text-[#0B1D3A] shadow-lg shadow-[#C9A84C]/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
              >
                <span className="relative z-10">Cerca immobili</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
              <Link
                href="/registrati"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-7 py-3.5 text-base font-medium text-white/70 transition-all duration-300 hover:text-white hover:border-white/30 hover:bg-white/5 backdrop-blur-sm"
              >
                Registrati gratis
              </Link>
            </div>
          </div>
        </section>

        {/* Come funziona */}
        <section className="relative bg-[#F8F6F1] py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C] mb-4">Il processo</span>
              <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-5xl">Come funziona per te</h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-[#0B1D3A]/50 leading-relaxed">
                Dall&apos;annuncio al rogito in 4 semplici passi.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((step) => (
                <div key={step.num} className="group rounded-3xl bg-white p-8 shadow-sm border border-[#C9A84C]/[0.08] transition-all duration-500 hover:shadow-xl hover:shadow-black/[0.04] hover:-translate-y-1">
                  <span className="text-4xl font-semibold bg-gradient-to-br from-[#C9A84C] to-[#B8943B] bg-clip-text text-transparent">{step.num}</span>
                  <h3 className="font-heading text-lg font-normal text-[#0B1D3A] mt-4 mb-3">{step.title}</h3>
                  <p className="text-sm text-[#0B1D3A]/50 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vantaggi */}
        <section className="relative bg-white py-24 md:py-32 overflow-hidden">
          <div className="absolute right-[-5%] top-[20%] w-48 h-48 rounded-full bg-[#C9A84C]/[0.03] blur-[60px]" />

          <div className="relative max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C] mb-4">I vantaggi</span>
              <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-5xl">Perché scegliere Privatio</h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-[#0B1D3A]/50 leading-relaxed">I vantaggi concreti per chi cerca casa.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {BENEFITS.map((b) => (
                <div key={b.title} className="group rounded-3xl bg-white p-8 border border-transparent shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-black/[0.04] hover:-translate-y-1 hover:border-[#C9A84C]/15">
                  <div className={`w-12 h-12 rounded-2xl ${b.color} flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
                    </svg>
                  </div>
                  <h3 className="font-heading text-lg font-normal text-[#0B1D3A] mb-2">{b.title}</h3>
                  <p className="text-sm text-[#0B1D3A]/50 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commissioni */}
        <section className="relative bg-[#F8F6F1] py-24 md:py-32">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/15 to-transparent" />
          <div className="max-w-3xl mx-auto px-4 text-center">
            <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C] mb-4">Trasparenza</span>
            <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-[#0B1D3A] mb-12 sm:text-5xl">Chi paga cosa?</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="relative rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white p-8 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-emerald-600">0%</span>
                </div>
                <h3 className="font-heading text-lg font-normal text-[#0B1D3A] mb-2">Venditore</h3>
                <p className="text-sm text-[#0B1D3A]/50 leading-relaxed">Il venditore non paga nessuna commissione. Questo è il cuore di Privatio.</p>
              </div>
              <div className="relative rounded-3xl border border-[#C9A84C]/15 bg-white p-8 shadow-sm overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />
                <div className="w-14 h-14 rounded-2xl bg-[#C9A84C]/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-sm font-bold text-[#C9A84C]">2-2,5%</span>
                </div>
                <h3 className="font-heading text-lg font-normal text-[#0B1D3A] mb-2">Acquirente</h3>
                <p className="text-sm text-[#0B1D3A]/50 leading-relaxed">Commissione negoziata direttamente con l&apos;agenzia. Nessun costo nascosto, totale trasparenza.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative bg-white py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C] mb-4">FAQ</span>
              <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-5xl">Domande frequenti</h2>
            </div>
            <div className="space-y-3">
              {FAQ.map((item) => (
                <details key={item.q} className="group rounded-2xl border border-[#C9A84C]/[0.08] bg-white overflow-hidden transition-shadow hover:shadow-sm">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-[#0B1D3A] font-medium hover:bg-[#F8F6F1]/50 transition-colors">
                    {item.q}
                    <svg className="w-5 h-5 text-[#C9A84C]/50 flex-shrink-0 ml-4 transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="px-6 pb-5 text-sm text-[#0B1D3A]/50 leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative bg-[#0B1D3A] py-24 md:py-32 overflow-hidden grain">
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#C9A84C]/[0.04] blur-[80px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />

          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C]/60 mb-4">Inizia ora</span>
            <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-white mb-5 sm:text-5xl">Pronto a trovare la tua casa?</h2>
            <p className="text-white/40 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              Registrati gratuitamente per salvare ricerche, aggiungere preferiti e ricevere alert sui nuovi immobili.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cerca" className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] px-8 py-4 text-base font-medium text-[#0B1D3A] shadow-lg shadow-[#C9A84C]/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden">
                <span className="relative z-10">Cerca immobili</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
              <Link href="/registrati" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-7 py-3.5 text-base font-medium text-white/70 transition-all duration-300 hover:text-white hover:border-white/30 hover:bg-white/5 backdrop-blur-sm">
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
