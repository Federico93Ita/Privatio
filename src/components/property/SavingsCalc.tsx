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

  const traditionalCommission = calculateSavings(price); // 3% of price
  const savings = traditionalCommission; // With Privatio = 0, so savings = full commission

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="font-heading text-3xl md:text-4xl text-text uppercase tracking-wide">
          Quanto risparmi con Privatio?
        </h2>
        <p className="text-text-muted text-base">
          Sposta il cursore e scopri quanto puoi risparmiare vendendo senza commissioni.
        </p>
      </div>

      {/* ---- Slider ---- */}
      <div className="space-y-3 px-2">
        <div className="flex items-center justify-between">
          <label htmlFor="savings-slider" className="text-sm font-medium text-text">
            Prezzo della casa
          </label>
          <span className="text-lg font-bold text-primary">
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
          className="w-full h-2.5 rounded-full appearance-none bg-border accent-primary cursor-pointer"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>{formatPrice(50_000)}</span>
          <span>{formatPrice(2_000_000)}</span>
        </div>
      </div>

      {/* ---- Comparison columns ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Traditional agency */}
        <div className="rounded-2xl border border-border bg-white p-6 space-y-3 text-center">
          <p className="text-sm font-medium text-text-muted uppercase tracking-wide">
            Agenzia tradizionale
          </p>
          <p className="text-text text-sm">
            Commissione venditore 3%
          </p>
          <div className="text-2xl md:text-3xl font-bold text-error">
            <AnimatedPrice value={traditionalCommission} className="text-error" />
          </div>
        </div>

        {/* Privatio */}
        <div
          className={cn(
            "rounded-2xl border-2 border-success bg-success/5 p-6 space-y-3 text-center",
            "relative overflow-hidden"
          )}
        >
          <p className="text-sm font-medium text-text-muted uppercase tracking-wide">
            Con Privatio
          </p>
          <p className="text-text text-sm">
            Commissione venditore
          </p>
          <p className="text-2xl md:text-3xl font-bold text-success">
            &euro; 0
          </p>
        </div>
      </div>

      {/* ---- Savings badge ---- */}
      <motion.div
        layout
        className="flex justify-center"
      >
        <div
          className={cn(
            "inline-flex items-center gap-2 px-6 py-3 rounded-full",
            "bg-accent/10 border border-accent/30"
          )}
        >
          <svg
            className="w-5 h-5 text-accent shrink-0"
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
          <span className="text-lg font-bold text-accent">
            Risparmi{" "}
            <AnimatedPrice value={savings} className="text-accent" />
          </span>
        </div>
      </motion.div>
    </div>
  );
}
