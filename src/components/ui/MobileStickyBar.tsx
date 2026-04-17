"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MobileStickyBar() {
  const [visible, setVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0B1D3A]/95 backdrop-blur-md border-t border-[#C9A84C]/10"
      style={{
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: prefersReducedMotion ? "none" : "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      aria-hidden={!visible}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white leading-tight">
            Zero commissioni.
          </span>
          <span className="text-[11px] text-white/50 leading-tight">
            Gratis · 5 minuti
          </span>
        </div>
        <Link
          href="/vendi"
          className="inline-flex items-center rounded-full bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] px-5 py-2.5 text-sm font-semibold text-[#0B1D3A] shadow-lg shadow-[#C9A84C]/20 transition-all duration-200 hover:shadow-xl hover:shadow-[#C9A84C]/30 active:scale-[0.97]"
          tabIndex={visible ? 0 : -1}
        >
          Inserisci ora
        </Link>
      </div>
    </div>
  );
}
