"use client";

import Link from "next/link";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#0B1D3A] overflow-hidden grain">
      {/* ---- Background layers ---- */}

      {/* Gradient orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[#C9A84C]/[0.06] blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#C9A84C]/[0.04] blur-[100px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
      <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full bg-blue-500/[0.03] blur-[80px]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating geometric shapes */}
      <div className="absolute top-[15%] right-[12%] w-20 h-20 border border-[#C9A84C]/10 rounded-2xl rotate-12 animate-float hidden lg:block" />
      <div className="absolute bottom-[25%] left-[8%] w-14 h-14 border border-white/5 rounded-xl -rotate-6 animate-float-slow hidden lg:block" />
      <div className="absolute top-[60%] right-[20%] w-10 h-10 border border-[#C9A84C]/8 rounded-lg rotate-45 animate-float hidden lg:block" style={{ animationDelay: "3s" }} />

      {/* Diagonal line accent */}
      <div className="absolute top-0 right-[30%] w-px h-[40%] bg-gradient-to-b from-transparent via-[#C9A84C]/10 to-transparent hidden lg:block" />

      {/* ---- Content ---- */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-32 text-center sm:px-6 lg:px-8">
        {/* Pill badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/5 px-5 py-2 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-[#C9A84C] animate-pulse" />
          <span className="text-sm text-[#C9A84C]/90 font-medium tracking-wide">Piattaforma attiva in tutta Italia</span>
        </div>

        <h1 className="font-heading text-5xl font-normal leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl lg:text-[5.5rem]">
          Vendi casa.
          <br />
          <span className="bg-gradient-to-r from-[#C9A84C] via-[#E0C96A] to-[#C9A84C] bg-clip-text text-transparent animate-gradient">
            Zero commissioni.
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/50 sm:text-xl">
          La prima piattaforma immobiliare italiana dove il venditore non
          paga nulla. Gestiamo tutto noi, con agenzie locali selezionate.
        </p>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/vendi"
            className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] px-8 py-4 text-base font-medium text-[#0B1D3A] shadow-lg shadow-[#C9A84C]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#C9A84C]/30 hover:-translate-y-0.5 overflow-hidden"
          >
            <span className="relative z-10">Inserisci il tuo immobile</span>
            <svg className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Link>
          <a
            href="#come-funziona"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-7 py-3.5 text-base font-medium text-white/70 transition-all duration-300 hover:text-white hover:border-white/30 hover:bg-white/5 backdrop-blur-sm"
          >
            Scopri come funziona
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </a>
        </div>

        {/* Animated counters */}
        <div className="mt-20 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto">
          {[
            { value: 150, suffix: "+", label: "Venditori iscritti" },
            { value: 45, suffix: "", label: "Agenzie partner" },
            { value: 0, suffix: "%", label: "Commissione venditore" },
          ].map((stat, i) => (
            <div key={i} className="relative text-center">
              {i > 0 && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              )}
              <p className="text-3xl font-semibold sm:text-4xl">
                <span className="bg-gradient-to-b from-[#C9A84C] to-[#D4B65E] bg-clip-text text-transparent">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </span>
              </p>
              <p className="text-[10px] text-white/30 mt-2 uppercase tracking-[0.15em] sm:text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-20 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C9A84C]/20" />
          <p className="text-[11px] text-white/25 uppercase tracking-[0.2em]">Agenzie certificate in tutta Italia</p>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C9A84C]/20" />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
