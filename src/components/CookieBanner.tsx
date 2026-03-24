"use client";

import { useState, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Consent types and storage                                          */
/* ------------------------------------------------------------------ */

export const COOKIE_KEY = "privatio-cookie-consent";

export interface CookieConsent {
  necessary: true; // always true
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

const CONSENT_VERSION = "1.0";

export function getConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.analytics === "boolean") return parsed;
    // Legacy format: migrate "accepted"/"declined"
    if (raw === "accepted") {
      const migrated: CookieConsent = { necessary: true, analytics: true, marketing: false, timestamp: new Date().toISOString(), version: CONSENT_VERSION };
      localStorage.setItem(COOKIE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    if (raw === "declined") {
      const migrated: CookieConsent = { necessary: true, analytics: false, marketing: false, timestamp: new Date().toISOString(), version: CONSENT_VERSION };
      localStorage.setItem(COOKIE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return null;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics === true;
}

export function resetConsent() {
  localStorage.removeItem(COOKIE_KEY);
  window.location.reload();
}

function saveConsent(consent: CookieConsent) {
  localStorage.setItem(COOKIE_KEY, JSON.stringify(consent));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept(analyticsOn: boolean, marketingOn: boolean) {
    const consent: CookieConsent = {
      necessary: true,
      analytics: analyticsOn,
      marketing: marketingOn,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    saveConsent(consent);
    setVisible(false);
    if (analyticsOn) {
      window.dispatchEvent(new Event("cookie-consent-accepted"));
    }
  }

  function handleAcceptAll() {
    accept(true, true);
  }

  function handleRejectAll() {
    accept(false, false);
  }

  function handleSavePreferences() {
    accept(analytics, marketing);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:bottom-6 sm:left-6 sm:right-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg shadow-black/5 border border-border p-5">
        <p className="text-sm text-text leading-relaxed">
          Utilizziamo cookie tecnici necessari al funzionamento del sito e, previo tuo consenso,
          cookie analitici per migliorare la tua esperienza.{" "}
          <a href="/cookie-policy" className="text-primary hover:underline font-medium">
            Maggiori informazioni
          </a>
        </p>

        {/* Granular toggle panel */}
        {showDetails && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            {/* Necessari — always on */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">Necessari</p>
                <p className="text-xs text-text-muted">Indispensabili per il funzionamento del sito</p>
              </div>
              <span className="text-xs text-text-muted bg-bg-soft px-2 py-1 rounded">Sempre attivi</span>
            </div>
            {/* Analitici */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">Analitici</p>
                <p className="text-xs text-text-muted">Google Analytics 4 — dati anonimizzati</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={analytics}
                onClick={() => setAnalytics(!analytics)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  analytics ? "bg-primary" : "bg-border"
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  analytics ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>
            {/* Marketing */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">Marketing</p>
                <p className="text-xs text-text-muted">Comunicazioni promozionali e remarketing</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={marketing}
                onClick={() => setMarketing(!marketing)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  marketing ? "bg-primary" : "bg-border"
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  marketing ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          {showDetails ? (
            <button
              onClick={handleSavePreferences}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/85 transition-colors shadow-sm"
            >
              Salva preferenze
            </button>
          ) : (
            <>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text border border-border rounded-lg hover:bg-bg-soft transition-colors"
              >
                Rifiuta tutti
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-sm font-medium text-text border border-border rounded-lg hover:bg-bg-soft transition-colors"
              >
                Personalizza
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/85 transition-colors shadow-sm"
              >
                Accetta tutti
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
