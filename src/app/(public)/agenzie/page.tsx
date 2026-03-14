import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AgenzieRegistrationForm from "./AgenzieRegistrationForm";
import AgenzieFAQ from "./AgenzieFAQ";

export const metadata: Metadata = {
  title: "Diventa Partner | Privatio",
  description:
    "Entra nel network Privatio. I venditori nella tua zona ti trovano e ti contattano direttamente. Gestisci la tua attività in autonomia dalla dashboard.",
};

/* ------------------------------------------------------------------ */
/*  Inline SVG Icons                                                   */
/* ------------------------------------------------------------------ */

function UsersIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-success"
    >
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
    description:
      "I venditori nella tua zona ti trovano direttamente nella piattaforma. Nessun costo di acquisizione, nessuna campagna pubblicitaria necessaria.",
  },
  {
    icon: <DocumentIcon />,
    title: "Lead venditori pre-qualificati",
    description:
      "I venditori possono contattarti direttamente. Chi non contatta un'agenzia entro 48h viene segnalato automaticamente. Il rapporto contrattuale lo gestisci direttamente tu con il cliente, in totale autonomia.",
  },
  {
    icon: <DashboardIcon />,
    title: "Dashboard gestione completa",
    description:
      "Gestisci l'intera pipeline immobiliare da un'unica piattaforma: sopralluoghi, pubblicazione annunci, visite, trattative e chiusura vendita.",
  },
  {
    icon: <MoneyIcon />,
    title: "Guadagni direttamente dal cliente",
    description:
      "La tua provvigione la concordi direttamente con il cliente. Privatio non trattiene commissioni sulle vendite e non interviene nella trattativa.",
  },
];

const piani = [
  {
    name: "Base",
    priceFrom: "200",
    features: [
      "1 area operativa",
      "Max 6 competitor/zona",
      "Visibilità nella lista venditore: 24h",
      "Profilo agenzia",
      "Dashboard base",
    ],
    cta: "Inizia con il Base",
    highlighted: false,
  },
  {
    name: "Premier Local",
    priceFrom: "390",
    features: [
      "2 aree operative",
      "Max 5 competitor/zona",
      "Visibilità nella lista venditore: 8h",
      "Priorità su Base",
      "Dashboard avanzata",
    ],
    cta: "Scegli Local",
    highlighted: false,
  },
  {
    name: "Premier City",
    priceFrom: "690",
    features: [
      "3 aree operative",
      "Max 4 competitor/zona",
      "Visibilità nella lista venditore: 2h",
      "Alta visibilità venditore",
      "Statistiche avanzate",
    ],
    cta: "Scegli City",
    highlighted: true,
  },
  {
    name: "Premier Prime",
    priceFrom: "1.100",
    features: [
      "3 aree operative",
      "Max 3 competitor/zona",
      "Visibilità nella lista venditore: 30 min",
      "Accesso zone top",
      "Supporto prioritario",
    ],
    cta: "Scegli Prime",
    highlighted: false,
  },
  {
    name: "Premier Elite",
    priceFrom: "1.800",
    features: [
      "4 aree operative",
      "Max 3 competitor/zona",
      "Visibilità istantanea nella lista venditore",
      "Prima posizione con venditore",
      "Branding premium",
    ],
    cta: "Scegli Elite",
    highlighted: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AgenziePage() {
  return (
    <>
      <Header />

      {/* ---- Hero ---- */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-light tracking-[-0.03em] text-text md:text-5xl">
            Porta la tua agenzia nel futuro
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-muted md:text-xl">
            Entra nel network Privatio e lasciati trovare dai venditori nella
            tua zona.
          </p>
          <a
            href="#registrazione"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-medium text-white shadow-sm shadow-primary/10 transition-all duration-300 hover:bg-primary/85"
          >
            Diventa Partner
          </a>
        </div>
      </section>

      {/* ---- Benefits ---- */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-light tracking-[-0.03em] text-primary-dark md:text-4xl">
            Perche scegliere Privatio
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-text-muted">
            Tutto cio di cui la tua agenzia ha bisogno per crescere, in
            un&apos;unica piattaforma.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  {b.icon}
                </div>
                <h3 className="mt-5 text-lg font-medium text-primary-dark" style={{ fontFamily: "var(--font-sans)" }}>
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {b.description}
                </p>
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
            Acquista presenza e priorita nelle zone in cui operi. Prezzi variabili
            in base al mercato della zona.
          </p>

          <div className="mx-auto mt-12 grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {piani.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
                  plan.highlighted
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-white">
                    Consigliato
                  </span>
                )}
                <h3 className="text-lg font-medium text-text" style={{ fontFamily: "var(--font-sans)" }}>
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-xs text-text-muted">da</span>
                  <span className="text-2xl font-medium text-primary-dark">
                    &euro;{plan.priceFrom}
                  </span>
                  <span className="text-text-muted text-sm">/mese</span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-text">
                      <CheckIcon />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
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

          <p className="text-center text-sm text-text-muted mt-8">
            Il prezzo varia in base al valore di mercato della zona scelta.
            Tutti i prezzi sono + IVA.
          </p>
        </div>
      </section>

      {/* ---- Registration Form ---- */}
      <section className="py-16 md:py-24" id="registrazione">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-light tracking-[-0.03em] text-primary-dark md:text-4xl">
            Diventa partner
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-text-muted">
            Compila il modulo e ti contatteremo entro 24 ore lavorative.
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

      <Footer />
    </>
  );
}
