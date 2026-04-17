"use client";

import { useEffect, useState } from "react";

/**
 * Badge countdown per offerta "3 mesi gratis" fino a data scadenza.
 * Scarcity reale, nessun dato inventato.
 */
interface CountdownBadgeProps {
  /** Data di scadenza offerta in formato YYYY-MM-DD */
  deadline: string;
  variant?: "navy" | "cream";
  label?: string;
}

function daysBetween(a: Date, b: Date) {
  const MS = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.ceil((b.getTime() - a.getTime()) / MS));
}

export default function CountdownBadge({
  deadline,
  variant = "navy",
  label = "3 mesi gratis per le agenzie",
}: CountdownBadgeProps) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(deadline + "T23:59:59");
    const tick = () => setDays(daysBetween(new Date(), target));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [deadline]);

  const isDark = variant === "navy";
  const isExpired = days !== null && days <= 0;

  if (isExpired) return null;

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full px-4 py-2 backdrop-blur-sm ${
        isDark
          ? "border border-[#C9A84C]/30 bg-[#C9A84C]/10"
          : "border border-[#C9A84C]/40 bg-white/80"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#C9A84C] opacity-75 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C9A84C]" />
      </span>
      <span
        className={`text-xs font-medium tracking-wide ${
          isDark ? "text-[#C9A84C]" : "text-[#0B1D3A]"
        }`}
      >
        {label} ·{" "}
        <span className="font-semibold">
          {days === null ? "—" : `${days} giorni`}
        </span>{" "}
        rimasti
      </span>
    </div>
  );
}
