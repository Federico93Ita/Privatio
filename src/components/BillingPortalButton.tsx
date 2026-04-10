"use client";

import { useState } from "react";

interface Props {
  label?: string;
  className?: string;
}

/**
 * Bottone che apre la Stripe Customer Portal Session per l'agenzia
 * loggata. Usato dal BillingBanner e dalla pagina fatturazione.
 */
export default function BillingPortalButton({
  label = "Gestisci abbonamento",
  className,
}: Props): React.ReactElement {
  const [loading, setLoading] = useState(false);

  async function openPortal(): Promise<void> {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Impossibile aprire il portale di fatturazione.");
        setLoading(false);
      }
    } catch {
      alert("Errore di rete. Riprova.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={openPortal}
      disabled={loading}
      className={
        className ||
        "rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      }
    >
      {loading ? "Apertura…" : label}
    </button>
  );
}
