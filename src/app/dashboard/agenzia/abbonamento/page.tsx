"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AgencyData {
  id: string;
  name: string;
  isActive: boolean;
  contractAcceptedAt: string | null;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AbbonamentoPage() {
  const router = useRouter();
  const [agency, setAgency] = useState<AgencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* Checkbox states */
  const [accettaContratto, setAccettaContratto] = useState(false);
  const [accettaPrivacy, setAccettaPrivacy] = useState(false);
  const [accettaZeroCommissioni, setAccettaZeroCommissioni] = useState(false);
  const [accettaClausole, setAccettaClausole] = useState(false);
  const [accettaRegistro, setAccettaRegistro] = useState(false);

  const allChecked = accettaContratto && accettaPrivacy && accettaZeroCommissioni && accettaClausole && accettaRegistro;

  /* Load agency data */
  useEffect(() => {
    fetch("/api/dashboard/agency/stats")
      .then((r) => r.json())
      .then((data) => {
        setAgency(data.agency);
        // If contract already accepted, redirect to territories
        if (data.agency?.contractAcceptedAt) {
          router.push("/dashboard/agenzia/territori");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  /* Submit contract acceptance */
  async function handleAcceptContract() {
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/agency/accept-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accettaContratto,
          accettaPrivacy,
          accettaZeroCommissioni,
          accettaClausole,
          accettaRegistro,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Errore durante l'accettazione");
      }

      // Redirect to territories page to select zone and pay
      router.push("/dashboard/agenzia/territori?contract=accepted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore imprevisto");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---- Styles ---- */
  const checkboxLabel = "flex items-start gap-3 cursor-pointer group";
  const checkboxInput =
    "mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer shrink-0";

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  if (loading) {
    return (
      <DashboardLayout role="agency">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Already accepted → show status
  if (agency?.contractAcceptedAt) {
    return (
      <DashboardLayout role="agency">
        <div className="max-w-2xl mx-auto py-10 px-4">
          <div className="bg-success/5 border border-success/15 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-success mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-text">Contratto gi&agrave; accettato</h2>
            <p className="text-text-muted mt-2 text-sm">
              Hai gi&agrave; accettato il Contratto di Convenzionamento. Puoi procedere alla gestione dei territori.
            </p>
            <Link
              href="/dashboard/agenzia/territori"
              className="inline-block mt-4 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/85 transition-colors"
            >
              Gestisci Territori
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="agency">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-text">Attiva il tuo abbonamento</h1>
          <p className="text-text-muted mt-1">
            Per accedere alla piattaforma e iniziare a ricevere immobili, accetta il Contratto di Convenzionamento
            e scegli il tuo territorio.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-medium">1</span>
            <span className="text-sm font-medium text-text">Accetta il contratto</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-bg-soft text-text-muted text-sm flex items-center justify-center font-medium">2</span>
            <span className="text-sm text-text-muted">Scegli territorio</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-bg-soft text-text-muted text-sm flex items-center justify-center font-medium">3</span>
            <span className="text-sm text-text-muted">Pagamento</span>
          </div>
        </div>

        {/* In breve */}
        <div className="bg-primary/5 border border-primary/15 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-primary-dark mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Il contratto in breve
          </h3>
          <ul className="space-y-1.5 text-sm text-text">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 text-xs">&#10003;</span>
              <span>Privatio ti fornisce <strong>Lead di venditori</strong> nella tua zona operativa</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 text-xs">&#10003;</span>
              <span><strong>Zero provvigioni ai venditori</strong> &mdash; guadagni solo dall&rsquo;acquirente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 text-xs">&#10003;</span>
              <span>Abbonamento mensile, <strong>disdici quando vuoi</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 text-xs">&#10003;</span>
              <span>Dati venditori riservati e protetti da GDPR</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 text-xs">&#10003;</span>
              <span>Posti limitati per zona &mdash; slot esclusivi per garantire qualit&agrave;</span>
            </li>
          </ul>
          <Link
            href="/contratto-agenzia"
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-3"
          >
            Leggi il contratto completo
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>

        {/* Checkboxes */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 space-y-5">
          <h3 className="text-lg font-medium text-text">Accettazione del contratto</h3>

          {/* Checkbox 1 - Contratto */}
          <label className={checkboxLabel}>
            <input
              type="checkbox"
              checked={accettaContratto}
              onChange={(e) => setAccettaContratto(e.target.checked)}
              className={checkboxInput}
            />
            <span className="text-sm text-text">
              Ho letto e accetto il{" "}
              <Link href="/contratto-agenzia" target="_blank" className="text-primary hover:underline font-medium">
                Contratto di Convenzionamento
              </Link>{" "}
              <span className="text-error">*</span>
            </span>
          </label>

          {/* Checkbox 2 - Privacy */}
          <label className={checkboxLabel}>
            <input
              type="checkbox"
              checked={accettaPrivacy}
              onChange={(e) => setAccettaPrivacy(e.target.checked)}
              className={checkboxInput}
            />
            <span className="text-sm text-text">
              Ho letto e accetto l&rsquo;
              <Link href="/privacy-policy" target="_blank" className="text-primary hover:underline font-medium">
                Informativa sulla Privacy
              </Link>{" "}
              <span className="text-error">*</span>
            </span>
          </label>

          {/* Checkbox 3 - Zero commissioni (highlighted) */}
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-lg p-4">
            <label className={checkboxLabel}>
              <input
                type="checkbox"
                checked={accettaZeroCommissioni}
                onChange={(e) => setAccettaZeroCommissioni(e.target.checked)}
                className={checkboxInput}
              />
              <span className="text-sm text-amber-900">
                Comprendo e accetto volontariamente che <strong>non potr&ograve; richiedere alcuna provvigione,
                commissione o compenso ai venditori</strong> il cui contatto &egrave; stato acquisito tramite Privatio
                (Art. 5-bis) <span className="text-error">*</span>
              </span>
            </label>
          </div>

          {/* Checkbox 4 - Clausole vessatorie (highlighted) */}
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-lg p-4">
            <label className={checkboxLabel}>
              <input
                type="checkbox"
                checked={accettaClausole}
                onChange={(e) => setAccettaClausole(e.target.checked)}
                className={checkboxInput}
              />
              <span className="text-sm text-amber-900">
                Ai sensi degli artt. 1341 e 1342 c.c., <strong>approvo specificamente le clausole</strong> elencate
                all&rsquo;Art. 16 del Contratto di Convenzionamento <span className="text-error">*</span>
              </span>
            </label>
          </div>

          {/* Checkbox 5 - Registro */}
          <label className={checkboxLabel}>
            <input
              type="checkbox"
              checked={accettaRegistro}
              onChange={(e) => setAccettaRegistro(e.target.checked)}
              className={checkboxInput}
            />
            <span className="text-sm text-text">
              Dichiaro di essere regolarmente iscritta al <strong>Registro degli Agenti di Affari in Mediazione</strong>{" "}
              ai sensi della L. 39/1989 <span className="text-error">*</span>
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="p-3 bg-error/10 border border-error/15 rounded-lg text-sm text-error">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleAcceptContract}
            disabled={!allChecked || submitting}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/85 transition-colors flex items-center justify-center gap-2"
          >
            {submitting && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {submitting ? "Accettazione in corso..." : "Accetta e prosegui"}
          </button>

          <p className="text-xs text-text-muted text-center">
            Dopo l&rsquo;accettazione potrai scegliere il territorio e procedere al pagamento
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
