"use client";

import { useState } from "react";

export default function TwoFactorSetup({
  isEnabled,
  onStatusChange,
}: {
  isEnabled: boolean;
  onStatusChange?: (enabled: boolean) => void;
}) {
  const [step, setStep] = useState<"idle" | "setup" | "verify" | "disable">("idle");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function startSetup() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/two-factor/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setQrCode(data.qrCode);
      setStep("verify");
    } catch {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/two-factor/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setSuccess("2FA attivato con successo!");
      setStep("idle");
      setQrCode(null);
      setCode("");
      onStatusChange?.(true);
    } catch {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  }

  async function disable2FA() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/two-factor/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setSuccess("2FA disattivato");
      setStep("idle");
      setCode("");
      onStatusChange?.(false);
    } catch {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-medium text-primary-dark">
          Autenticazione a Due Fattori (2FA)
        </h2>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            isEnabled
              ? "bg-success/10 text-success"
              : "bg-bg-soft text-text-muted"
          }`}
        >
          {isEnabled ? "Attivo" : "Non attivo"}
        </span>
      </div>
      <p className="text-sm text-text-muted mb-4">
        Aggiungi un livello di sicurezza extra al tuo account usando un&apos;app
        authenticator come Google Authenticator o Authy.
      </p>

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-success/10 text-success text-sm font-medium">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm font-medium">
          {error}
        </div>
      )}

      {/* Idle state */}
      {step === "idle" && !isEnabled && (
        <button
          onClick={startSetup}
          disabled={loading}
          className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/85 transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? "Caricamento..." : "Attiva 2FA"}
        </button>
      )}

      {step === "idle" && isEnabled && (
        <button
          onClick={() => {
            setStep("disable");
            setError(null);
            setSuccess(null);
          }}
          className="px-5 py-2.5 border border-error/30 text-error rounded-lg font-medium hover:bg-error/5 transition-colors text-sm"
        >
          Disattiva 2FA
        </button>
      )}

      {/* QR code + verify */}
      {step === "verify" && qrCode && (
        <div className="space-y-4">
          <div className="bg-bg-soft rounded-lg p-4">
            <p className="text-sm text-text mb-3 font-medium">
              1. Scansiona il QR code con la tua app authenticator:
            </p>
            <div className="flex justify-center">
              <img src={qrCode} alt="QR Code 2FA" width={200} height={200} />
            </div>
          </div>

          <div>
            <p className="text-sm text-text mb-2 font-medium">
              2. Inserisci il codice a 6 cifre generato dall&apos;app:
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-32 px-4 py-2.5 border border-border rounded-lg text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={verifyCode}
                disabled={loading || code.length !== 6}
                className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/85 transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? "Verifica..." : "Verifica e Attiva"}
              </button>
              <button
                onClick={() => {
                  setStep("idle");
                  setQrCode(null);
                  setCode("");
                  setError(null);
                }}
                className="px-5 py-2.5 border border-border text-text-muted rounded-lg font-medium hover:bg-bg-soft transition-colors text-sm"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disable form */}
      {step === "disable" && (
        <div className="space-y-3">
          <p className="text-sm text-text">
            Inserisci il codice corrente dall&apos;app authenticator per disattivare il 2FA:
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-32 px-4 py-2.5 border border-border rounded-lg text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={disable2FA}
              disabled={loading || code.length !== 6}
              className="px-5 py-2.5 bg-error text-white rounded-lg font-medium hover:bg-error/85 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? "Disattivazione..." : "Disattiva"}
            </button>
            <button
              onClick={() => {
                setStep("idle");
                setCode("");
                setError(null);
              }}
              className="px-5 py-2.5 border border-border text-text-muted rounded-lg font-medium hover:bg-bg-soft transition-colors text-sm"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
