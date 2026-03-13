"use client";

import { useState, useMemo } from "react";
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
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-6">
      {/* Title */}
      <h3 className="font-medium text-lg text-text">
        Calcola la tua rata
      </h3>

      {/* ---- Prezzo immobile ---- */}
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
              "focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary",
              "transition-colors"
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">
            &euro;
          </span>
        </div>
      </div>

      {/* ---- Anticipo % ---- */}
      <div className="space-y-1.5">
        <label htmlFor="mortgage-down" className="block text-sm font-medium text-text">
          Anticipo: <span className="text-primary font-medium">{downPaymentPct}%</span>
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

      {/* ---- Durata ---- */}
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

      {/* ---- Tasso % ---- */}
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
            "focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary",
            "transition-colors"
          )}
        />
      </div>

      {/* ---- Output ---- */}
      <div className="rounded-xl bg-bg-soft p-5 text-center space-y-1">
        <p className="text-text-muted text-sm">Rata mensile stimata</p>
        <p className="text-3xl font-semibold text-primary">
          {formatPrice(Math.round(monthlyPayment))}
        </p>
        <p className="text-text-muted text-xs">/ mese</p>
      </div>

      {/* ---- Disclaimer ---- */}
      <p className="text-text-muted text-xs leading-relaxed">
        Calcolo indicativo. Contatta la tua banca per un preventivo.
      </p>
    </div>
  );
}
