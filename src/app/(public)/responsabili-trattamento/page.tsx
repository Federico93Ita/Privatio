import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Responsabili del Trattamento — Privatio",
  description:
    "Elenco dei responsabili del trattamento dei dati personali ai sensi dell'art. 28 del Regolamento UE 2016/679 (GDPR).",
};

/* ------------------------------------------------------------------ */
/*  Data processors                                                    */
/* ------------------------------------------------------------------ */

const processors = [
  {
    name: "Supabase Inc.",
    service: "Database e storage",
    location: "San Francisco, CA, USA",
    data: "Tutti i dati personali della piattaforma",
    transfer: "Standard Contractual Clauses (SCCs)",
    dpa: "https://supabase.com/legal/dpa",
  },
  {
    name: "Vercel Inc.",
    service: "Hosting e CDN",
    location: "San Francisco, CA, USA",
    data: "Dati di navigazione, indirizzo IP",
    transfer: "Standard Contractual Clauses (SCCs)",
    dpa: "https://vercel.com/legal/dpa",
  },
  {
    name: "Stripe Inc.",
    service: "Elaborazione pagamenti",
    location: "San Francisco, CA, USA",
    data: "Dati di fatturazione agenzie",
    transfer: "Standard Contractual Clauses (SCCs)",
    dpa: "https://stripe.com/legal/dpa",
  },
  {
    name: "Resend Inc.",
    service: "Servizio email transazionali",
    location: "San Francisco, CA, USA",
    data: "Indirizzi email, nomi",
    transfer: "Standard Contractual Clauses (SCCs)",
    dpa: "https://resend.com/legal/dpa",
  },
  {
    name: "Google LLC",
    service: "Analytics, Maps, OAuth",
    location: "Mountain View, CA, USA",
    data: "Dati di navigazione, geolocalizzazione, autenticazione",
    transfer: "Standard Contractual Clauses (SCCs)",
    dpa: "https://business.safety.google/processorterms/",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ResponsabiliTrattamentoPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <div className="bg-primary-dark text-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/"
            className="text-white/60 hover:text-white text-sm mb-4 inline-block"
          >
            &larr; Torna alla home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">
            Responsabili del Trattamento
          </h1>
          <p className="text-white/70 mt-2">
            Elenco ai sensi dell&rsquo;art.&nbsp;28 del Regolamento UE
            2016/679 (GDPR)
          </p>
        </div>
      </div>

      <main className="bg-bg-soft py-12">
        <div className="max-w-3xl mx-auto px-4">
          {/* Introduction */}
          <div className="bg-white rounded-xl border border-border p-6 mb-8 text-sm text-text-muted leading-relaxed space-y-3">
            <p>
              Ai sensi dell&rsquo;art.&nbsp;28 del Regolamento (UE) 2016/679
              (&ldquo;GDPR&rdquo;), il Titolare del trattamento &egrave; tenuto
              a comunicare l&rsquo;elenco dei soggetti terzi che trattano dati
              personali per suo conto in qualit&agrave; di Responsabili del
              trattamento.
            </p>
            <p>
              Ciascun Responsabile &egrave; stato selezionato in quanto
              presenta garanzie sufficienti per mettere in atto misure tecniche
              e organizzative adeguate, in modo tale che il trattamento soddisfi
              i requisiti del GDPR e garantisca la tutela dei diritti
              dell&rsquo;interessato.
            </p>
            <p>
              Il trasferimento di dati personali verso paesi terzi (extra
              UE/SEE) avviene esclusivamente sulla base delle Clausole
              Contrattuali Standard (&ldquo;SCCs&rdquo;) adottate dalla
              Commissione Europea, ai sensi dell&rsquo;art.&nbsp;46, par.&nbsp;2,
              lett.&nbsp;c) del GDPR.
            </p>
          </div>

          {/* Processor cards */}
          <div className="space-y-4">
            {processors.map((p) => (
              <div
                key={p.name}
                className="bg-white rounded-xl border border-border p-6 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-primary-dark">
                      {p.name}
                    </h2>
                    <p className="text-sm text-text-muted">{p.service}</p>
                  </div>
                  <span className="text-xs text-text-muted bg-bg-soft rounded-full px-3 py-1 whitespace-nowrap self-start">
                    {p.location}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-text uppercase tracking-wide mb-0.5">
                      Dati trattati
                    </p>
                    <p className="text-text-muted">{p.data}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text uppercase tracking-wide mb-0.5">
                      Garanzia trasferimento
                    </p>
                    <p className="text-text-muted">{p.transfer}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  <a
                    href={p.dpa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Consulta il Data Processing Agreement (DPA)
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-10 bg-primary/5 border border-primary/15 rounded-xl p-6 text-sm text-text-muted leading-relaxed space-y-3">
            <p>
              Le nomine formali a Responsabile del Trattamento sono sottoscritte
              separatamente con ciascun fornitore. Per richieste relative al
              trattamento dei dati, contattare{" "}
              <a
                href="mailto:privacy@privatio.it"
                className="text-primary hover:underline font-medium"
              >
                privacy@privatio.it
              </a>
              .
            </p>
          </div>

          {/* Page version */}
          <div className="mt-8 text-center text-xs text-text-muted">
            <p>
              Privatio &mdash; Piattaforma Tecnologica di Vetrina Immobiliare
              Digitale
            </p>
            <p className="mt-1">Ultimo aggiornamento &mdash; Marzo 2026</p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
