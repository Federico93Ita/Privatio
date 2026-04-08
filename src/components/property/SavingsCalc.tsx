"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, formatNumber, calculateSavings, cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Animated number display                                            */
/* ------------------------------------------------------------------ */

function AnimatedPrice({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={className}
      >
        {formatPrice(value)}
      </motion.span>
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SavingsCalc() {
  const [price, setPrice] = useState(250_000);

  const traditionalCommission = calculateSavings(price); // 4% of price
  const savings = traditionalCommission; // With Privatio = 0, so savings = full commission

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#C9A84C]/[0.04] blur-[60px]" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#0B1D3A]/[0.03] blur-[40px]" />

      <div className="relative space-y-10">
        {/* Title */}
        <div className="text-center space-y-3">
          <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C] mb-1">Calcola il risparmio</span>
          <h2 className="font-heading text-4xl font-normal tracking-[-0.02em] text-[#0B1D3A] sm:text-5xl">
            Quanto risparmi con Privatio?
          </h2>
          <p className="text-[#0B1D3A]/50 text-base sm:text-lg">
            Sposta il cursore e scopri quanto puoi risparmiare vendendo senza commissioni.
          </p>
        </div>

        {/* ---- Slider ---- */}
        <div className="space-y-4 px-2 pt-4">
          <div className="flex items-center justify-between">
            <label htmlFor="savings-slider" className="text-sm font-medium text-[#0B1D3A]/70">
              Prezzo della casa
            </label>
            <span className="text-xl font-semibold bg-gradient-to-r from-[#0B1D3A] to-[#0B1D3A]/80 bg-clip-text text-transparent">
              <AnimatedPrice value={price} />
            </span>
          </div>
          <input
            id="savings-slider"
            type="range"
            min={50_000}
            max={2_000_000}
            step={10_000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[#0B1D3A]/30 font-medium">
            <span>{formatPrice(50_000)}</span>
            <span>{formatPrice(2_000_000)}</span>
          </div>
        </div>

        {/* ---- Comparison columns ---- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {/* Traditional agency */}
          <div className="relative flex h-full flex-col justify-between rounded-3xl border border-red-100 bg-gradient-to-br from-red-50/50 to-white p-7 space-y-3 text-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
            <p className="text-sm font-medium text-[#0B1D3A]/50 uppercase tracking-wide">
              Agenzia tradizionale
            </p>
            <p className="text-[#0B1D3A]/40 text-sm">
              Commissione venditore 4%
            </p>
            <div className="text-3xl md:text-4xl font-semibold text-red-500">
              <AnimatedPrice value={traditionalCommission} className="text-red-500" />
            </div>
          </div>

          {/* Privatio */}
          <div className="relative flex h-full flex-col justify-between rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white p-7 space-y-3 text-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
            <p className="text-sm font-medium text-[#0B1D3A]/50 uppercase tracking-wide">
              Con Privatio
            </p>
            <p className="text-[#0B1D3A]/40 text-sm">
              Commissione venditore
            </p>
            <p className="text-3xl md:text-4xl font-semibold text-emerald-600">
              &euro; 0
            </p>
          </div>
        </div>

        {/* ---- Savings badge ---- */}
        <motion.div layout className="flex justify-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C9A84C]/[0.08] to-[#C9A84C]/[0.04] border border-[#C9A84C]/20 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A84C]/15">
              <svg
                className="w-5 h-5 text-[#C9A84C]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs text-[#0B1D3A]/40 font-medium uppercase tracking-wide">Risparmi</p>
              <p className="text-xl font-semibold bg-gradient-to-r from-[#C9A84C] to-[#B8943B] bg-clip-text text-transparent">
                <AnimatedPrice value={savings} className="bg-gradient-to-r from-[#C9A84C] to-[#B8943B] bg-clip-text text-transparent" />
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
