"use client";

import { useState, useEffect } from "react";

const COOKIE_KEY = "privatio-cookie-consent";

type ConsentStatus = "accepted" | "declined" | null;

function getConsent(): ConsentStatus {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(COOKIE_KEY);
  if (value === "accepted" || value === "declined") return value;
  return null;
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === "accepted";
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (!consent) {
      // Small delay so it doesn't block initial render
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
    // Trigger analytics load
    window.dispatchEvent(new Event("cookie-consent-accepted"));
  }

  function handleDecline() {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-[#1e293b] leading-relaxed">
            Utilizziamo cookie tecnici necessari al funzionamento del sito e, previo tuo consenso,
            cookie analitici per migliorare la tua esperienza.{" "}
            <a
              href="/cookie-policy"
              className="text-[#0e8ff1] hover:underline font-medium"
            >
              Maggiori informazioni
            </a>
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#0a1f44] border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors"
          >
            Rifiuta
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0e8ff1] rounded-lg hover:bg-[#0a1f44] transition-colors"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}
