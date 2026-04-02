import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

const benefits = [
  "I venditori nella tua zona possono trovarti e contattarti direttamente",
  "Abbonamento territoriale: investi nella tua zona e ricevi lead continui",
  "Dashboard dedicata per gestire immobili e visite",
  "Supporto marketing e visibilità su tutti i portali",
];

export default function AgencyCTA() {
  return (
    <section className="py-20 md:py-28 bg-[#F8F6F1]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl rounded-3xl bg-[#0B1D3A] p-10 md:p-14 text-center relative overflow-hidden">
            {/* Gold accent bar at top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

            <h2 className="font-heading text-3xl font-normal tracking-[-0.02em] text-white sm:text-4xl">
              Sei un&apos;agenzia?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/60 sm:text-lg">
              Unisciti alla rete di agenzie partner e lasciati trovare
              dai venditori nella tua zona.
            </p>

            <ul className="mt-8 inline-block space-y-3 text-left">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A84C]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-white/60">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Link
                href="/agenzie"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-7 py-3.5 text-base font-medium text-[#0B1D3A] shadow-lg shadow-[#C9A84C]/20 transition-all duration-300 hover:bg-[#D4B65E] hover:-translate-y-0.5"
              >
                Diventa Partner
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
