"use client";

import { useState, useEffect } from "react";

export const COOKIE_KEY = "privatio-cookie-consent";

type ConsentStatus = "accepted" | "declined" | null;

export function getConsent(): ConsentStatus {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(COOKIE_KEY);
  if (value === "accepted" || value === "declined") return value;
  return null;
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === "accepted";
}

export function resetConsent() {
  localStorage.removeItem(COOKIE_KEY);
  window.location.reload();
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
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:bottom-6 sm:left-6 sm:right-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg shadow-black/5 border border-border p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-text leading-relaxed">
            Utilizziamo cookie tecnici necessari al funzionamento del sito e, previo tuo consenso,
            cookie analitici per migliorare la tua esperienza.{" "}
            <a
              href="/cookie-policy"
              className="text-primary hover:underline font-medium"
            >
              Maggiori informazioni
            </a>
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text border border-border rounded-lg hover:bg-bg-soft transition-colors duration-200"
          >
            Rifiuta
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/85 transition-colors duration-300 shadow-sm shadow-primary/10"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}
