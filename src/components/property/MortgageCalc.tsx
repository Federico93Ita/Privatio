"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, calculateMortgage, cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MortgageCalcProps {
  defaultPrice: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DURATION_OPTIONS = [15, 20, 25, 30] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MortgageCalc({ defaultPrice }: MortgageCalcProps) {
  const [price, setPrice] = useState(defaultPrice);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [years, setYears] = useState<number>(25);
  const [rate, setRate] = useState(3.5);

  const monthlyPayment = useMemo(
    () => calculateMortgage(price, downPaymentPct, years, rate),
    [price, downPaymentPct, years, rate]
  );

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      {/* Header with icon */}
      <div className="px-6 pt-6 pb-0 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-none">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
          </svg>
        </div>
        <div>
          <h3 className="font-medium text-lg text-text tracking-[-0.02em]">
            Calcola la tua rata
          </h3>
          <p className="text-xs text-text-muted">Simulazione mutuo indicativa</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-0">
        {/* ---- Left: Inputs (3 cols) ---- */}
        <div className="md:col-span-3 p-6 space-y-5">
          {/* Prezzo immobile */}
          <div className="space-y-1.5">
            <label htmlFor="mortgage-price" className="block text-sm font-medium text-text">
              Prezzo immobile
            </label>
            <div className="relative">
              <input
                id="mortgage-price"
                type="number"
                min={10000}
                step={1000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={cn(
                  "w-full rounded-lg border border-border px-4 py-2.5 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                  "transition-all"
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">
                &euro;
              </span>
            </div>
          </div>

          {/* Anticipo % */}
          <div className="space-y-1.5">
            <label htmlFor="mortgage-down" className="block text-sm font-medium text-text">
              Anticipo: <span className="text-primary font-semibold">{downPaymentPct}%</span>
              <span className="text-text-muted font-normal ml-2">
                ({formatPrice(Math.round(price * downPaymentPct / 100))})
              </span>
            </label>
            <input
              id="mortgage-down"
              type="range"
              min={10}
              max={50}
              step={1}
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-border accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-xs text-text-muted">
              <span>10%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Durata */}
          <div className="space-y-1.5">
            <span className="block text-sm font-medium text-text">Durata (anni)</span>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYears(y)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200",
                    years === y
                      ? "bg-primary text-white shadow-sm"
                      : "bg-bg-soft text-text-muted hover:bg-border"
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Tasso % */}
          <div className="space-y-1.5">
            <label htmlFor="mortgage-rate" className="block text-sm font-medium text-text">
              Tasso annuo (%)
            </label>
            <input
              id="mortgage-rate"
              type="number"
              min={0.1}
              max={15}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className={cn(
                "w-full rounded-lg border border-border px-4 py-2.5 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                "transition-all"
              )}
            />
          </div>
        </div>

        {/* ---- Right: Result (2 cols) ---- */}
        <div className="md:col-span-2 bg-gradient-to-br from-primary/[0.03] to-primary/[0.08] p-6 flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l border-border">
          {/* Decorative ring with euro icon */}
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full border-2 border-primary/10 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <p className="text-text-muted text-sm mb-1">Rata mensile stimata</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={Math.round(monthlyPayment)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-4xl font-semibold text-primary tracking-tight"
            >
              {formatPrice(Math.round(monthlyPayment))}
            </motion.p>
          </AnimatePresence>
          <p className="text-text-muted text-xs mt-1">al mese</p>

          {/* Summary details */}
          <div className="w-full mt-6 pt-4 border-t border-primary/10 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Importo finanziato</span>
              <span className="font-medium text-text">
                {formatPrice(Math.round(price * (1 - downPaymentPct / 100)))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Durata</span>
              <span className="font-medium text-text">{years} anni</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Tasso</span>
              <span className="font-medium text-text">{rate}%</span>
            </div>
          </div>

          <p className="text-text-muted text-[11px] leading-relaxed mt-4 px-2">
            Calcolo indicativo. Contatta la tua banca per un preventivo personalizzato.
          </p>
        </div>
      </div>
    </div>
  );
}
