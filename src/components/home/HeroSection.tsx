import Link from "next/link";

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
          Perché pagare migliaia di euro di provvigioni? Su Privatio il
          venditore non paga nulla. Un&apos;agenzia della tua zona gestisce
          tutto, tu incassi il 100%.
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

        {/* Value badges */}
        <div className="mt-20 grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mx-auto">
          {[
            {
              label: "Attivo in tutta Italia",
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              ),
            },
            {
              label: "Agenzie certificate",
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              ),
            },
            {
              label: "0% commissione venditore",
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              ),
            },
          ].map((badge, i) => (
            <div key={i} className="relative text-center flex flex-col items-center gap-2">
              {i > 0 && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              )}
              <span className="text-[#C9A84C]">{badge.icon}</span>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.15em] sm:text-xs leading-tight">{badge.label}</p>
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
