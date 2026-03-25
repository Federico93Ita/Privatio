import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AgenzieRegistrationForm from "./AgenzieRegistrationForm";
import AgenzieFAQ from "./AgenzieFAQ";

export const metadata: Metadata = {
  title: "Diventa Partner | Privatio",
  description:
    "Entra nel network Privatio. I venditori nella tua zona ti trovano e ti contattano direttamente.",
};

/* ------------------------------------------------------------------ */
/*  Inline SVG Icons                                                   */
/* ------------------------------------------------------------------ */

function UsersIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success shrink-0">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const benefits = [
  {
    icon: <UsersIcon />,
    title: "Clienti garantiti senza ricerca",
    description: "I venditori nella tua zona ti trovano direttamente. Nessun costo di acquisizione.",
  },
  {
    icon: <DocumentIcon />,
    title: "Lead venditori pre-qualificati",
    description: "I venditori ti contattano direttamente. Il rapporto contrattuale lo gestisci in totale autonomia.",
  },
  {
    icon: <DashboardIcon />,
    title: "Dashboard gestione completa",
    description: "Gestisci l'intera pipeline immobiliare da un'unica piattaforma.",
  },
  {
    icon: <MoneyIcon />,
    title: "Guadagni direttamente dal cliente",
    description: "La tua provvigione la concordi direttamente con il cliente. Privatio non trattiene commissioni.",
  },
];

const piani = [
  {
    name: "Base",
    subtitle: "Comuni piccoli e rurali",
    tiers: [
      { label: "Cluster rurale", price: 300, slots: 3 },
      { label: "Comune < 20.000 ab.", price: 400, slots: 4 },
    ],
    features: [
      "1 zona operativa inclusa",
      "Notifica nuovi immobili 24h",
      "Profilo agenzia in piattaforma",
      "Dashboard di gestione base",
      "Max 3–4 agenzie per zona",
    ],
    cta: "Inizia con il Base",
    highlighted: false,
  },
  {
    name: "Locale",
    subtitle: "Comuni medi e periferie",
    tiers: [
      { label: "Comune 20k\u201380k ab.", price: 650, slots: 5 },
      { label: "Macroquartiere periferia", price: 850, slots: 5 },
    ],
    features: [
      "Fino a 2 zone operative",
      "Notifica nuovi immobili 8h",
      "Dashboard avanzata completa",
      "Visibilit\u00e0 locale garantita",
      "Max 5 agenzie per zona",
    ],
    cta: "Scegli Locale",
    highlighted: false,
  },
  {
    name: "City",
    subtitle: "Centri urbani e zone OMI",
    tiers: [
      { label: "Macroquartiere centro", price: 1100, slots: 6 },
      { label: "Microzona OMI classe B", price: 1500, slots: 6 },
    ],
    features: [
      "Fino a 3 zone operative",
      "Notifica nuovi immobili 2h",
      "Alta visibilit\u00e0 venditori",
      "Statistiche avanzate e report",
      "Max 6 agenzie per zona",
    ],
    cta: "Scegli City",
    highlighted: true,
  },
  {
    name: "Prime",
    subtitle: "Top city e zone premium",
    tiers: [
      { label: "Microzona OMI classe A", price: 2200, slots: 6 },
      { label: "OMI premium", price: 3200, slots: 6 },
    ],
    features: [
      "Fino a 4 zone operative",
      "Notifica istantanea immobili",
      "Prima posizione ricerche",
      "Branding premium e supporto",
      "Max 6 agenzie per zona",
    ],
    cta: "Scegli Prime",
    highlighted: false,
  },
];

const addons = [
  {
    name: "Slot aggiuntivo",
    price: "\u201335% sul piano attivo",
    description: "Acquista una seconda zona territoriale con sconto del 35%.",
  },
  {
    name: "Badge \"Agenzia verificata\"",
    price: "+\u20AC75/mese",
    description: "Badge visibile sui listing assegnati alla tua agenzia.",
  },
  {
    name: "Priority boost",
    price: "+\u20AC100/mese",
    description: "Appari prima nelle notifiche ai venditori della tua zona.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AgenziePage() {
  return (
    <>
      <Header />

      <main id="main-content">
      {/* ---- Hero ---- */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 bg-gradient-to-b from-primary/[0.03] to-transparent">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-accent">Posti limitati per zona</span>
          </div>
          <h1 className="text-4xl font-light tracking-[-0.03em] text-text md:text-5xl">
            Assicurati l&apos;esclusivit&agrave; nella tua zona
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-muted md:text-xl">
            Solo un numero limitato di agenzie per zona. Una volta assegnata, nessun altro pu&ograve; toglierti il posto.
          </p>
          <a
            href="#registrazione"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-medium text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/85 hover:-translate-y-0.5"
          >
            Entra in lista d&apos;attesa
          </a>
        </div>
      </section>

      {/* ---- Benefits ---- */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-light tracking-[-0.03em] text-primary-dark md:text-4xl">
            Perch&eacute; scegliere Privatio
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-text-muted">
            Tutto ci&ograve; di cui la tua agenzia ha bisogno per crescere, in un&apos;unica piattaforma.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.title} className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  {b.icon}
                </div>
                <h3 className="mt-5 text-lg font-medium text-primary-dark">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Pricing ---- */}
      <section className="bg-bg-soft py-16 md:py-24" id="piani">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-light tracking-[-0.03em] text-primary-dark md:text-4xl">
            Scegli il tuo piano
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-text-muted">
            Prezzi fissi per tipo di zona. Nessuna sorpresa: selezioni il territorio e vedi il prezzo esatto.
          </p>

          {/* 4 plan cards */}
          <div className="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {piani.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
                  plan.highlighted ? "border-primary ring-2 ring-primary/20" : "border-border"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-white">
                    Pi&ugrave; scelto
                  </span>
                )}

                {/* Header */}
                <div>
                  <h3 className="text-lg font-semibold text-text">{plan.name}</h3>
                  <p className="text-xs text-text-muted mt-0.5">{plan.subtitle}</p>
                </div>

                {/* Price tiers */}
                <div className="mt-4 space-y-2">
                  {plan.tiers.map((tier) => (
                    <div key={tier.label} className="rounded-lg bg-bg-soft px-3 py-2 flex items-baseline justify-between gap-2">
                      <span className="text-[11px] text-text-muted leading-tight">{tier.label}</span>
                      <span className="text-sm font-bold text-primary-dark whitespace-nowrap">
                        &euro;{tier.price.toLocaleString("it-IT")}
                        <span className="text-[10px] font-normal text-text-muted">/mese</span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Features — flex-grow so CTA stays at bottom */}
                <ul className="mt-5 space-y-2.5 flex-grow">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] leading-snug text-text">
                      <CheckIcon />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA — always at bottom */}
                <a
                  href="#registrazione"
                  className={`mt-6 block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "border border-primary text-primary hover:bg-primary/5"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>

          {/* Add-ons */}
          <div className="mx-auto mt-10 max-w-4xl">
            <h3 className="text-center text-lg font-medium text-text mb-5">Add-on opzionali</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {addons.map((addon) => (
                <div key={addon.name} className="rounded-xl border border-border bg-white p-5">
                  <p className="text-sm font-semibold text-text">{addon.name}</p>
                  <p className="text-xs font-medium text-primary mt-1">{addon.price}</p>
                  <p className="text-xs text-text-muted mt-2">{addon.description}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-text-muted mt-8">
            Tutti i prezzi sono + IVA. Lo sconto annuale si applica al canone base, non agli add-on.
          </p>
        </div>
      </section>

      {/* ---- Registration Form ---- */}
      <section className="py-16 md:py-24" id="registrazione">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-light tracking-[-0.03em] text-primary-dark md:text-4xl">
            Entra in lista d&apos;attesa
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-text-muted">
            Compila il modulo per riservare la tua zona. Ti contatteremo entro 24 ore lavorative.
          </p>
          <div className="mt-10">
            <AgenzieRegistrationForm />
          </div>
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section className="bg-bg-soft py-16 md:py-24" id="faq">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-light tracking-[-0.03em] text-primary-dark md:text-4xl">
            Domande frequenti
          </h2>
          <div className="mt-10">
            <AgenzieFAQ />
          </div>
        </div>
      </section>

      </main>

      <Footer />
    </>
  );
}
