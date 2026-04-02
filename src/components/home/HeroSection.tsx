import Link from "next/link";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#0B1D3A] overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(201,168,76,0.05),transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-32 text-center sm:px-6 lg:px-8">
        <h1 className="font-heading text-5xl font-normal leading-[1.1] tracking-[-0.02em] text-white sm:text-6xl lg:text-7xl">
          Vendi casa.
          <br />
          <span className="text-[#C9A84C]">Zero commissioni.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/60">
          La prima piattaforma immobiliare italiana dove il venditore non
          paga nulla. Gestiamo tutto noi, con agenzie locali selezionate.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/vendi"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-8 py-4 text-base font-medium text-[#0B1D3A] shadow-lg shadow-[#C9A84C]/20 transition-all duration-300 hover:bg-[#D4B65E] hover:shadow-xl hover:-translate-y-0.5"
          >
            Inserisci il tuo immobile
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <a
            href="#come-funziona"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-base font-medium text-white/80 transition-all duration-200 hover:text-white hover:border-white/40 hover:bg-white/5"
          >
            Scopri come funziona
          </a>
        </div>

        {/* Animated counters */}
        <div className="mt-16 flex items-center justify-center gap-8 sm:gap-16">
          <div className="text-center">
            <p className="text-3xl font-semibold text-[#C9A84C]">
              <AnimatedCounter value={150} suffix="+" />
            </p>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">Venditori iscritti</p>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-3xl font-semibold text-[#C9A84C]">
              <AnimatedCounter value={45} />
            </p>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">Agenzie partner</p>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-3xl font-semibold text-[#C9A84C]">
              <AnimatedCounter value={0} suffix="%" />
            </p>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">Commissione venditore</p>
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-16 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-[#C9A84C]/30" />
          <p className="text-xs text-white/30 uppercase tracking-widest">Agenzie certificate in tutta Italia</p>
          <div className="h-px w-12 bg-[#C9A84C]/30" />
        </div>
      </div>
    </section>
  );
}
