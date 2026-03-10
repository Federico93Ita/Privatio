import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AgenzieRegistrationForm from "./AgenzieRegistrationForm";
import AgenzieFAQ from "./AgenzieFAQ";

export const metadata: Metadata = {
  title: "Diventa Partner | Privatio",
  description:
    "Entra nel network Privatio. Ricevi clienti venditori pre-qualificati, gestisci tutto dalla dashboard e guadagna provvigioni certe.",
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
      "Ricevi lead di venditori pre-qualificati direttamente nella tua dashboard. Nessun costo di acquisizione, nessuna campagna pubblicitaria necessaria.",
  },
  {
    icon: <DocumentIcon />,
    title: "Contratti di esclusiva gia firmati",
    description:
      "Ogni incarico arriva con un contratto di esclusiva digitale gia firmato dal venditore. Lavori in totale serenita senza rischio di perdere il mandato.",
  },
  {
    icon: <DashboardIcon />,
    title: "Dashboard gestione completa",
    description:
      "Gestisci l'intera pipeline immobiliare da un'unica piattaforma: sopralluoghi, pubblicazione annunci, visite, trattative e chiusura vendita.",
  },
  {
    icon: <MoneyIcon />,
    title: "Provvigioni certe 1.5-2%",
    description:
      "La provvigione viene applicata esclusivamente all'acquirente. Tu guadagni una percentuale garantita sul prezzo di vendita, senza sorprese.",
  },
];

const pianoBase = {
  name: "Piano Base",
  price: "49",
  features: [
    "Max 5 immobili attivi",
    "Dashboard gestione",
    "Notifiche email",
    "Supporto base",
  ],
  cta: "Inizia con il Base",
  highlighted: false,
};

const pianoPro = {
  name: "Piano Pro",
  price: "99",
  features: [
    "Immobili illimitati",
    "Dashboard avanzata",
    "Priorita assegnazione",
    "Supporto prioritario",
    "Statistiche avanzate",
    "Badge Premium",
  ],
  cta: "Scegli il Pro",
  highlighted: true,
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AgenziePage() {
  return (
    <>
      <Header />

      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden bg-primary-dark pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Decorative gradient blob */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl uppercase leading-tight tracking-wide text-white md:text-5xl lg:text-6xl">
            Porta la tua agenzia nel futuro
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
            Entra nel network Privatio e ricevi clienti venditori senza doverli
            cercare.
          </p>
          <a
            href="#registrazione"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            Diventa Partner
          </a>
        </div>
      </section>

      {/* ---- Benefits ---- */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-center text-3xl uppercase tracking-wide text-primary-dark md:text-4xl">
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
                <h3 className="mt-5 text-lg font-semibold text-primary-dark" style={{ fontFamily: "var(--font-sans)" }}>
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
          <h2 className="font-heading text-center text-3xl uppercase tracking-wide text-primary-dark md:text-4xl">
            Scegli il tuo piano
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-text-muted">
            Prezzi trasparenti, nessun costo nascosto. Inizia subito.
          </p>

          <div className="mx-auto mt-12 grid max-w-4xl gap-8 lg:grid-cols-2">
            {[pianoBase, pianoPro].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border bg-white p-8 shadow-sm transition-shadow hover:shadow-md ${
                  plan.highlighted
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white">
                    Consigliato
                  </span>
                )}
                <h3 className="text-xl font-bold text-primary-dark" style={{ fontFamily: "var(--font-sans)" }}>
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-primary-dark">
                    &euro;{plan.price}
                  </span>
                  <span className="text-text-muted">/mese</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-text">
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#registrazione"
                  className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
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
        </div>
      </section>

      {/* ---- Registration Form ---- */}
      <section className="py-16 md:py-24" id="registrazione">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-center text-3xl uppercase tracking-wide text-primary-dark md:text-4xl">
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
          <h2 className="font-heading text-center text-3xl uppercase tracking-wide text-primary-dark md:text-4xl">
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
