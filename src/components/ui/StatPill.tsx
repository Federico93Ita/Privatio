import { ReactNode } from "react";

interface StatPillProps {
  value: ReactNode;
  label: string;
  variant?: "navy" | "cream";
}

export default function StatPill({ value, label, variant = "navy" }: StatPillProps) {
  const isDark = variant === "navy";
  return (
    <div
      className={`flex flex-col items-center rounded-2xl px-5 py-4 ${
        isDark
          ? "border border-white/10 bg-white/[0.03]"
          : "border border-[#0B1D3A]/10 bg-white"
      }`}
    >
      <span
        className={`font-heading text-3xl md:text-4xl leading-none ${
          isDark ? "text-[#C9A84C]" : "text-[#0B1D3A]"
        }`}
      >
        {value}
      </span>
      <span
        className={`mt-2 text-[11px] uppercase tracking-[0.15em] text-center ${
          isDark ? "text-white/50" : "text-[#0B1D3A]/50"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
