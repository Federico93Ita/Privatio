import Link from "next/link";
import CountdownBadge from "@/components/ui/CountdownBadge";
import { LAUNCH_CONFIG } from "@/lib/launch-config";

/**
 * Editorial hero: H1 gigante, eyebrow gold, mesh gradient navy,
 * CTA primario + countdown reale offerta Fondatore.
 */
export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center mesh-navy overflow-hidden grain pt-20 pb-16">
      {/* Decorative shapes */}
      <div className="absolute top-[15%] right-[10%] w-24 h-24 border border-[#C9A84C]/10 rounded-2xl rotate-12 animate-float hidden lg:block" />
      <div className="absolute bottom-[22%] left-[8%] w-16 h-16 border border-white/5 rounded-xl -rotate-6 animate-float-slow hidden lg:block" />
      <div className="absolute top-[55%] right-[18%] w-10 h-10 border border-[#C9A84C]/10 rounded-lg rotate-45 animate-float hidden lg:block" style={{ animationDelay: "3s" }} />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(201,168,76,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.4) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="animate-fade-in">
          <span className="eyebrow text-[#C9A84C]/80">
            Il nuovo modo di vendere casa in Italia
          </span>
        </div>

        {/* H1 gigante */}
        <h1 className="mt-6 h-display text-white animate-slide-up">
          Basta pagare <br className="hidden sm:block" />
          per vendere <span className="ink-gold">casa tua.</span>
        </h1>

        {/* Sub netto */}
        <p
          className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl animate-slide-up"
          style={{ animationDelay: "0.15s" }}
        >
          Pubblichi gratis. Scegli l&apos;agenzia della tua zona.
          Lei gestisce visite e rogito. <strong className="text-white">Tu incassi il 100%.</strong>
        </p>

        {/* CTA area */}
        <div
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            href="/vendi"
            className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] px-8 py-4 text-base font-semibold text-[#0B1D3A] shadow-xl shadow-[#C9A84C]/25 transition-all duration-300 hover:shadow-2xl hover:shadow-[#C9A84C]/40 hover:-translate-y-0.5 overflow-hidden"
          >
            <span className="relative z-10">Inserisci il tuo immobile</span>
            <svg className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Link>
          <a
            href="#risparmio"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-7 py-3.5 text-base font-medium text-white/80 transition-all duration-300 hover:text-white hover:border-white/30 hover:bg-white/5 backdrop-blur-sm"
          >
            Calcola il tuo risparmio
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </a>
        </div>

        {/* Microcopy CTA */}
        <p className="mt-5 text-xs text-white/50 tracking-wide animate-fade-in" style={{ animationDelay: "0.45s" }}>
          Gratis · 5 minuti · zero carta di credito
        </p>

        {/* Countdown offerta pre-lancio */}
        <div className="mt-14 flex justify-center animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <CountdownBadge
            deadline={LAUNCH_CONFIG.founderOfferDeadline}
            label="Offerta Fondatore agenzie in scadenza"
          />
        </div>

        {/* Big stats */}
        <div className="mt-20 grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="font-heading text-3xl md:text-5xl text-[#C9A84C] leading-none">0%</div>
            <p className="mt-2 text-[10px] sm:text-xs text-white/50 uppercase tracking-[0.15em] leading-tight">
              commissione<br/>venditore
            </p>
          </div>
          <div className="text-center border-x border-white/10">
            <div className="font-heading text-3xl md:text-5xl text-[#C9A84C] leading-none">48h</div>
            <p className="mt-2 text-[10px] sm:text-xs text-white/50 uppercase tracking-[0.15em] leading-tight">
              scegli<br/>l&apos;agenzia
            </p>
          </div>
          <div className="text-center">
            <div className="font-heading text-3xl md:text-5xl text-[#C9A84C] leading-none">100%</div>
            <p className="mt-2 text-[10px] sm:text-xs text-white/50 uppercase tracking-[0.15em] leading-tight">
              ricavato<br/>al venditore
            </p>
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-16 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C9A84C]/20" />
          <p className="text-[11px] text-white/30 uppercase tracking-[0.2em]">
            Agenzie certificate · attivo in tutta Italia
          </p>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C9A84C]/20" />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
