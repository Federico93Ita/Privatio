import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SavingsCalc from "@/components/property/SavingsCalc";
import LeadForm from "@/components/forms/LeadForm";
import { formatPrice } from "@/lib/utils";

/* ================================================================== */
/*  SVG Icon components (inline for SSR)                               */
/* ================================================================== */

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  );
}

function HandshakeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

function HeadsetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
      />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
      />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
      />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
      />
    </svg>
  );
}

/* ================================================================== */
/*  Static data                                                        */
/* ================================================================== */

const howItWorksSteps = [
  {
    num: 1,
    icon: ClipboardIcon,
    title: "Inserisci il tuo immobile",
    description:
      "Gratis e in soli 5 minuti. Carica foto e descrizione del tuo immobile.",
  },
  {
    num: 2,
    icon: HandshakeIcon,
    title: "Ti assegniamo un'agenzia locale",
    description:
      "Selezioniamo un'agenzia partner verificata nella tua zona.",
  },
  {
    num: 3,
    icon: KeyIcon,
    title: "Incassi il 100%",
    description:
      "L'agenzia gestisce tutto: visite, trattativa, documentazione. Tu non paghi nulla.",
  },
];

const features = [
  {
    icon: CheckIcon,
    title: "0% commissione venditore",
    description:
      "Nessuna commissione a carico del venditore. Il ricavato della vendita è tutto tuo.",
  },
  {
    icon: ShieldIcon,
    title: "Agenzie verificate e locali",
    description:
      "Collaboriamo solo con agenzie certificate e radicate nel territorio.",
  },
  {
    icon: DocumentIcon,
    title: "Contratto digitale firmato online",
    description:
      "Firma digitale sicura per tutti i documenti. Niente code o carta.",
  },
  {
    icon: HeadsetIcon,
    title: "Supporto dedicato fino alla vendita",
    description:
      "Un consulente ti segue in ogni fase, dalla pubblicazione al rogito.",
  },
  {
    icon: CameraIcon,
    title: "Foto e planimetrie professionali",
    description:
      "Servizio fotografico e planimetrie inclusi per valorizzare il tuo immobile.",
  },
  {
    icon: GlobeIcon,
    title: "Visibilità su tutti i portali",
    description:
      "Il tuo annuncio pubblicato su Immobiliare.it, Idealista, Casa.it e altri portali.",
  },
];

const showcaseProperties = [
  {
    id: "1",
    title: "Trilocale luminoso con balcone",
    city: "Milano",
    province: "MI",
    price: 320000,
    surface: 95,
    rooms: 3,
    gradient: "from-primary/30 to-primary-dark/30",
  },
  {
    id: "2",
    title: "Appartamento ristrutturato centro storico",
    city: "Roma",
    province: "RM",
    price: 285000,
    surface: 80,
    rooms: 2,
    gradient: "from-accent/30 to-primary/30",
  },
  {
    id: "3",
    title: "Villa bifamiliare con giardino",
    city: "Torino",
    province: "TO",
    price: 450000,
    surface: 160,
    rooms: 5,
    gradient: "from-success/30 to-primary/30",
  },
];

const testimonials = [
  {
    quote:
      "Ho venduto il mio appartamento a Milano senza pagare un centesimo di commissione. Incredibile.",
    author: "Marco R.",
    location: "Milano",
    savings: 9000,
    stars: 5,
  },
  {
    quote:
      "Servizio professionale e trasparente. L'agenzia assegnata è stata impeccabile.",
    author: "Giulia P.",
    location: "Roma",
    savings: 7500,
    stars: 5,
  },
  {
    quote:
      "Finalmente una piattaforma dalla parte del venditore. La consiglio a tutti.",
    author: "Andrea B.",
    location: "Torino",
    savings: 12000,
    stars: 5,
  },
];

const agencyBenefits = [
  "Ricevi contatti qualificati e pre-verificati nella tua zona",
  "Nessun costo di ingresso: paghi solo a vendita conclusa",
  "Dashboard dedicata per gestire immobili e visite",
  "Supporto marketing e visibilità su tutti i portali",
];

/* ================================================================== */
/*  Page component (Server Component)                                  */
/* ================================================================== */

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="overflow-hidden">
        {/* ============================================================ */}
        {/*  1. HERO                                                      */}
        {/* ============================================================ */}
        <section className="relative flex min-h-screen items-center bg-gradient-to-b from-white to-bg-soft pt-20">
          {/* Decorative blurred circles */}
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
            {/* ---- Left column: Copy ---- */}
            <div className="flex flex-col items-start gap-6 text-left">
              <h1 className="font-heading text-5xl leading-[1.1] tracking-wide text-text sm:text-6xl lg:text-7xl">
                Vendi casa.
                <br />
                <span className="text-primary">Zero commissioni.</span>
              </h1>

              <p className="max-w-lg text-lg leading-relaxed text-text-muted sm:text-xl">
                La prima piattaforma immobiliare italiana dove il venditore non
                paga nulla. Gestiamo tutto noi, con agenzie locali selezionate.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/vendi"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                >
                  Inserisci il tuo immobile gratis
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <a
                  href="#come-funziona"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-transparent px-7 py-3.5 text-lg font-semibold text-primary transition-all hover:bg-primary/5"
                >
                  Scopri come funziona
                </a>
              </div>

              <p className="flex items-center gap-2 text-sm text-text-muted">
                <svg
                  className="h-4 w-4 text-success"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
                Già 150+ venditori iscritti | 45 agenzie partner
              </p>
            </div>

            {/* ---- Right column: House illustration ---- */}
            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
              <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-bg-soft to-accent/10 p-8 shadow-2xl">
                {/* Simplified house shape */}
                <div className="flex h-full flex-col items-center justify-center gap-4">
                  {/* Roof */}
                  <div className="h-0 w-0 border-b-[60px] border-l-[80px] border-r-[80px] border-b-primary/20 border-l-transparent border-r-transparent sm:border-b-[80px] sm:border-l-[100px] sm:border-r-[100px]" />
                  {/* Body */}
                  <div className="relative flex h-28 w-40 items-center justify-center rounded-b-lg bg-primary/15 sm:h-36 sm:w-48">
                    {/* Door */}
                    <div className="h-16 w-10 rounded-t-full bg-primary/25 sm:h-20 sm:w-12" />
                    {/* Windows */}
                    <div className="absolute left-3 top-3 h-8 w-8 rounded bg-white/60 sm:h-10 sm:w-10" />
                    <div className="absolute right-3 top-3 h-8 w-8 rounded bg-white/60 sm:h-10 sm:w-10" />
                  </div>
                </div>

                {/* Badge overlay */}
                <div className="absolute bottom-6 right-6 rounded-2xl bg-white px-5 py-3 shadow-xl">
                  <p className="text-center font-heading text-2xl tracking-wide text-success sm:text-3xl">
                    0%
                  </p>
                  <p className="text-xs font-semibold text-text-muted">
                    commissioni
                  </p>
                </div>

                {/* Decorative dots */}
                <div className="absolute left-4 top-4 grid grid-cols-3 gap-1.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-primary/20"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  2. SAVINGS CALCULATOR                                        */}
        {/* ============================================================ */}
        <section
          id="risparmio"
          className="bg-white py-20 md:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SavingsCalc />
          </div>
        </section>

        {/* ============================================================ */}
        {/*  3. COME FUNZIONA                                             */}
        {/* ============================================================ */}
        <section
          id="come-funziona"
          className="bg-bg-soft py-20 md:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <h2 className="font-heading text-3xl tracking-wide text-text sm:text-4xl md:text-5xl">
                Come Funziona
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
                Tre semplici passaggi per vendere il tuo immobile senza
                commissioni.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-10">
              {howItWorksSteps.map((step) => (
                <div
                  key={step.num}
                  className="relative rounded-2xl border border-border bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-lg"
                >
                  {/* Step number badge */}
                  <div className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-md">
                    {step.num}
                  </div>

                  {/* Icon */}
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-text">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-muted">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  4. PERCHÉ PRIVATIO (Trust section)                           */}
        {/* ============================================================ */}
        <section className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <h2 className="font-heading text-3xl tracking-wide text-text sm:text-4xl md:text-5xl">
                Perché scegliere Privatio
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
                Tutto ciò che serve per vendere in tranquillità, senza
                commissioni.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-text">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-muted">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  5. IMMOBILI IN VETRINA                                       */}
        {/* ============================================================ */}
        <section className="bg-bg-soft py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <h2 className="font-heading text-3xl tracking-wide text-text sm:text-4xl md:text-5xl">
                Immobili in Vetrina
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
                Scopri alcune delle proprietà attualmente in vendita sulla nostra
                piattaforma.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {showcaseProperties.map((property) => (
                <div
                  key={property.id}
                  className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Photo placeholder */}
                  <div
                    className={`relative aspect-[4/3] bg-gradient-to-br ${property.gradient}`}
                  >
                    <div className="flex h-full items-center justify-center">
                      <svg
                        className="h-16 w-16 text-white/40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                        />
                      </svg>
                    </div>
                    {/* Badge */}
                    <span className="absolute left-3 top-3 rounded-full bg-success/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      0% comm. venditore
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col gap-2 p-5">
                    <h3 className="text-base font-semibold text-text transition-colors group-hover:text-primary">
                      {property.title}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {property.city}, {property.province}
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(property.price)}
                    </p>
                    <div className="flex items-center gap-4 border-t border-border pt-2 text-sm text-text-muted">
                      <span>{property.surface} mq</span>
                      <span>{property.rooms} locali</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/cerca"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-transparent px-7 py-3 text-base font-semibold text-primary transition-all hover:bg-primary hover:text-white"
              >
                Vedi tutti gli immobili
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  6. TESTIMONIALS                                              */}
        {/* ============================================================ */}
        <section className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <h2 className="font-heading text-3xl tracking-wide text-text sm:text-4xl md:text-5xl">
                Chi ha venduto con Privatio
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
                Leggi le esperienze di chi ha già venduto casa senza
                commissioni.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.author}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg md:p-8"
                >
                  {/* Stars */}
                  <div>
                    <div className="mb-4 flex gap-0.5">
                      {Array.from({ length: testimonial.stars }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className="h-5 w-5 text-accent"
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-base leading-relaxed text-text">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                  </div>

                  {/* Author + savings */}
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <div>
                      <p className="text-sm font-semibold text-text">
                        {testimonial.author}
                      </p>
                      <p className="text-xs text-text-muted">
                        {testimonial.location}
                      </p>
                    </div>
                    <div className="rounded-full bg-success/10 px-3 py-1">
                      <p className="text-xs font-bold text-success">
                        Risparmio: {formatPrice(testimonial.savings)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  7. AGENCIES CTA                                              */}
        {/* ============================================================ */}
        <section className="bg-primary-dark py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              {/* Copy */}
              <div>
                <h2 className="font-heading text-3xl tracking-wide text-white sm:text-4xl md:text-5xl">
                  Sei un&apos;agenzia?
                  <br />
                  Entra nel network Privatio
                </h2>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
                  Unisciti alla rete di agenzie partner e ricevi contatti
                  qualificati nella tua zona.
                </p>

                <ul className="mt-8 space-y-4">
                  {agencyBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-white/90 sm:text-base">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10">
                  <Link
                    href="/agenzie"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-7 py-3.5 text-lg font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent/90 hover:shadow-xl"
                  >
                    Diventa Partner
                    <ArrowRightIcon className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              {/* Decorative right column */}
              <div className="hidden lg:flex lg:justify-center">
                <div className="relative h-80 w-80 rounded-3xl bg-white/5 p-8">
                  <div className="flex h-full flex-col items-center justify-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/20">
                      <HandshakeIcon className="h-10 w-10 text-accent" />
                    </div>
                    <div className="text-center">
                      <p className="font-heading text-4xl tracking-wide text-white">
                        45+
                      </p>
                      <p className="mt-1 text-sm text-white/60">
                        agenzie partner in tutta Italia
                      </p>
                    </div>
                  </div>
                  {/* Decorative ring */}
                  <div className="absolute inset-0 rounded-3xl border border-white/10" />
                  <div className="absolute -inset-3 rounded-[2rem] border border-white/5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  8. LEAD FORM                                                 */}
        {/* ============================================================ */}
        <section
          id="inizia"
          className="bg-bg-soft py-20 md:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="font-heading text-3xl tracking-wide text-text sm:text-4xl md:text-5xl">
                Inizia ora. È gratis.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
                Compila il form e ti ricontatteremo entro 24 ore per assegnarti
                un&apos;agenzia partner nella tua zona.
              </p>
            </div>

            <LeadForm />
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/*  9. FOOTER                                                     */}
      {/* ============================================================ */}
      <Footer />
    </>
  );
}
