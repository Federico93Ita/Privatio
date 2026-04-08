import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AgenzieRegistrationForm from "./AgenzieRegistrationForm";
import AgenzieFAQ from "./AgenzieFAQ";

export const metadata: Metadata = {
  title: "Diventa Partner | Privatio",
  description: "Entra nel network Privatio. I venditori nella tua zona ti trovano e ti contattano direttamente.",
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const benefits = [
  {
    title: "Clienti garantiti senza ricerca",
    description: "I venditori nella tua zona ti trovano direttamente. Nessun costo di acquisizione.",
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Lead venditori pre-qualificati",
    description: "I venditori ti contattano direttamente. Il rapporto contrattuale lo gestisci in totale autonomia.",
    icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    color: "bg-[#C9A84C]/10 text-[#C9A84C]",
  },
  {
    title: "Dashboard gestione completa",
    description: "Gestisci l'intera pipeline immobiliare da un'unica piattaforma.",
    icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Guadagni direttamente dal cliente",
    description: "La tua provvigione la concordi direttamente con il cliente. Privatio non trattiene commissioni.",
    icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "bg-emerald-500/10 text-emerald-600",
  },
];

const piani = [
  {
    name: "Zona Base",
    subtitle: "Comuni piccoli e rurali",
    tiers: [
      { label: "Cluster rurale (< 5.000 ab.)", price: 249, founderPrice: 224, example: "Area Monferrato Nord" },
      { label: "Comune singolo (5k\u201320k ab.)", price: 499, founderPrice: 449, example: "Nizza Monferrato" },
    ],
    features: ["Fino a 3 zone operative", "Notifica nuovi immobili 24h", "Profilo agenzia in piattaforma", "Dashboard di gestione completa", "Max 3\u20134 agenzie per zona"],
    cta: "Inizia con Zona Base",
    highlighted: false,
  },
  {
    name: "Zona Urbana",
    subtitle: "Centri medi e periferie citt\u00e0",
    tiers: [
      { label: "Comune 20k\u2013100k ab.", price: 499, founderPrice: 449, example: "Asti, Moncalieri" },
      { label: "Quartiere periferico citt\u00e0", price: 999, founderPrice: 899, example: "Torino \u2014 Mirafiori Sud" },
    ],
    features: ["Fino a 3 zone operative", "Notifica nuovi immobili 8h", "Visibilit\u00e0 locale garantita", "Statistiche avanzate e report", "Max 4\u20136 agenzie per zona"],
    cta: "Scegli Zona Urbana",
    highlighted: false,
  },
  {
    name: "Zona Premium",
    subtitle: "Centri storici e zone pregio",
    tiers: [
      { label: "Quartiere semicentrale", price: 999, founderPrice: 899, example: "Torino \u2014 San Salvario" },
      { label: "Centro storico / zona top", price: 2600, founderPrice: 2340, example: "Torino \u2014 Centro / Crocetta" },
    ],
    features: ["Fino a 3 zone operative", "Notifica istantanea immobili", "Prima posizione nelle ricerche", "Branding premium e supporto", "Max 4\u20137 agenzie per zona"],
    cta: "Scegli Zona Premium",
    highlighted: false,
  },
];

const addons = [
  { name: "Zona aggiuntiva", price: "\u201315% sulla seconda zona", description: "Espandi il tuo territorio su una zona limitrofa con sconto del 15%." },
  { name: "Badge \"Agenzia verificata\"", price: "+\u20AC75/mese", description: "Badge visibile sui listing assegnati alla tua agenzia." },
  { name: "Priority boost", price: "+\u20AC100/mese", description: "Appari prima nelle notifiche ai venditori della tua zona." },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Come funziona la lista d'attesa?", acceptedAnswer: { "@type": "Answer", text: "Compilando il modulo entri in lista d'attesa per la tua zona. Quando le iscrizioni apriranno nella tua area, sarai tra i primi a essere contattato. I posti sono limitati per ogni zona." } },
    { "@type": "Question", name: "Quanto costa l'abbonamento?", acceptedAnswer: { "@type": "Answer", text: "Il prezzo dipende dalla zona: da €224/mese per zone rurali fino a €2.340/mese per centri storici. Prezzo Fondatore bloccato per 12 mesi con -10%. I primi 3 mesi sono gratuiti. Nessun costo aggiuntivo sulle vendite." } },
    { "@type": "Question", name: "Posso disdire in qualsiasi momento?", acceptedAnswer: { "@type": "Answer", text: "Sì. L'abbonamento è mensile e senza vincoli. Puoi disdire in qualsiasi momento dalla dashboard." } },
  ],
};

export default function AgenziePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Header />
      <main id="main-content">
        {/* Hero */}
        <section className="relative bg-[#0B1D3A] pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden grain">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C9A84C]/[0.05] blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#C9A84C]/[0.03] blur-[80px]" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />

          <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/5 px-5 py-2 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#C9A84C] animate-pulse" />
              <span className="text-sm font-medium text-[#C9A84C]/90">Posti limitati per zona</span>
            </div>
            <h1 className="font-heading text-4xl font-normal tracking-[-0.02em] text-white md:text-6xl mb-6">
              Assicurati l&apos;esclusivit&agrave; nella tua zona
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/50 md:text-xl">
              Solo un numero limitato di agenzie per zona. Una volta assegnata, nessun altro pu&ograve; toglierti il posto.
            </p>
            <a
              href="#registrazione"
              className="mt-10 group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] px-8 py-4 text-base font-medium text-[#0B1D3A] shadow-lg shadow-[#C9A84C]/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden"
            >
              <span className="relative z-10">Entra in lista d&apos;attesa</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </a>
          </div>
        </section>

        {/* Benefits */}
        <section className="relative bg-white py-24 md:py-32 overflow-hidden">
          <div className="absolute right-[-5%] top-[20%] w-48 h-48 rounded-full bg-[#C9A84C]/[0.03] blur-[60px]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C] mb-4">I vantaggi</span>
              <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-5xl">
                Perch&eacute; scegliere Privatio
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-[#0B1D3A]/50 leading-relaxed">
                Tutto ci&ograve; di cui la tua agenzia ha bisogno per crescere, in un&apos;unica piattaforma.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((b) => (
                <div key={b.title} className="group rounded-3xl bg-white p-7 border border-transparent shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-black/[0.04] hover:-translate-y-1 hover:border-[#C9A84C]/15">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${b.color} transition-transform duration-500 group-hover:scale-110`}>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
                    </svg>
                  </div>
                  <h3 className="mt-5 font-heading text-lg font-normal text-[#0B1D3A]">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#0B1D3A]/50">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="relative bg-[#F8F6F1] py-24 md:py-32" id="piani">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/15 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C] mb-4">Piani</span>
              <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-5xl">Scegli la tua zona</h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-[#0B1D3A]/50 leading-relaxed">
                Prezzo Fondatore bloccato per 12 mesi. I primi 3 mesi sono offerti da noi.
              </p>
            </div>

            {/* Founder offer banner */}
            <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-[#C9A84C]/20 bg-gradient-to-r from-[#C9A84C]/[0.06] to-[#D4B65E]/[0.04] p-5 sm:p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="h-5 w-5 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                <p className="text-sm font-semibold text-[#0B1D3A]">
                  Offerta Fondatore — <span className="text-[#C9A84C]">3 mesi gratuiti</span> + prezzo bloccato 12 mesi al <span className="text-[#C9A84C]">-10%</span>
                </p>
              </div>
              <p className="text-xs text-[#0B1D3A]/40">Per le prime agenzie che si iscrivono. Posti limitati per zona.</p>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
              {piani.map((plan) => (
                <div
                  key={plan.name}
                  className="relative flex h-full flex-col rounded-3xl bg-white p-7 shadow-sm border border-[#C9A84C]/[0.08] transition-all duration-500 hover:shadow-xl hover:shadow-black/[0.04] hover:-translate-y-1 hover:border-[#C9A84C]/20 overflow-hidden"
                >
                  <div>
                    <h3 className="font-heading text-xl font-normal text-[#0B1D3A]">{plan.name}</h3>
                    <p className="text-xs text-[#0B1D3A]/40 mt-1">{plan.subtitle}</p>
                  </div>

                  <div className="mt-5 space-y-2">
                    {plan.tiers.map((tier) => (
                      <div key={tier.label} className="rounded-2xl bg-[#F8F6F1] px-4 py-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[11px] text-[#0B1D3A]/40 leading-tight">{tier.label}</span>
                          <div className="flex items-baseline gap-2 whitespace-nowrap">
                            <span className="text-xs text-[#0B1D3A]/30 line-through">
                              &euro;{tier.price.toLocaleString("it-IT")}
                            </span>
                            <span className="text-sm font-bold text-[#0B1D3A]">
                              &euro;{tier.founderPrice.toLocaleString("it-IT")}
                              <span className="text-[10px] font-normal text-[#0B1D3A]/40">/mese</span>
                            </span>
                            <span className="text-[9px] font-semibold text-[#C9A84C] bg-[#C9A84C]/10 rounded-full px-1.5 py-0.5">-10%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] text-[#C9A84C]/70 text-center font-medium mt-1">+ 3 mesi gratuiti</p>
                  </div>

                  <ul className="mt-6 space-y-3 flex-grow">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px] leading-snug text-[#0B1D3A]/70">
                        <svg className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#registrazione"
                    className="mt-7 block w-full rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] py-3 text-center text-sm font-semibold text-[#0B1D3A] shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>

            {/* Add-ons */}
            <div className="mx-auto mt-14 max-w-4xl">
              <h3 className="text-center font-heading text-xl font-normal text-[#0B1D3A] mb-6">Add-on opzionali</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {addons.map((addon) => (
                  <div key={addon.name} className="rounded-2xl border border-[#C9A84C]/[0.08] bg-white p-6 shadow-sm">
                    <p className="font-medium text-[#0B1D3A]">{addon.name}</p>
                    <p className="text-xs font-semibold text-[#C9A84C] mt-1">{addon.price}</p>
                    <p className="text-xs text-[#0B1D3A]/40 mt-3 leading-relaxed">{addon.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-[#0B1D3A]/30 mt-10">
              Tutti i prezzi sono + IVA. Prezzo Fondatore bloccato per 12 mesi per chi si iscrive durante il lancio. I primi 3 mesi sono gratuiti.
            </p>
          </div>
        </section>

        {/* Registration Form */}
        <section className="relative bg-white py-24 md:py-32 overflow-hidden" id="registrazione">
          <div className="absolute left-[-5%] top-[20%] w-48 h-48 rounded-full bg-[#C9A84C]/[0.03] blur-[60px]" />
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C] mb-4">Registrati</span>
              <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-5xl">Entra in lista d&apos;attesa</h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-[#0B1D3A]/50 leading-relaxed">
                Compila il modulo per riservare la tua zona. Ti contatteremo entro 24 ore lavorative.
              </p>
            </div>
            <AgenzieRegistrationForm />
          </div>
        </section>

        {/* FAQ */}
        <section className="relative bg-[#F8F6F1] py-24 md:py-32" id="faq">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/15 to-transparent" />
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C] mb-4">FAQ</span>
              <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-5xl">Domande frequenti</h2>
            </div>
            <AgenzieFAQ />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
