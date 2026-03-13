"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatDate } from "@/lib/utils";

export default function SellerContractPage() {
  const [property, setProperty] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otp, setOtp] = useState("");
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState("");
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/seller")
      .then((r) => r.json())
      .then((data) => {
        const prop = data.property;
        setProperty(prop);
        setContract(prop?.contract);
      })
      .catch(() => setOtpError("Errore nel caricamento del contratto. Riprova."))
      .finally(() => setLoading(false));
  }, []);

  async function handleRequestOtp() {
    if (!contract) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch(`/api/contracts/${contract.id}/otp`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
      } else {
        setOtpError(data.error || "Errore nell'invio del codice OTP");
      }
    } catch {
      setOtpError("Errore di connessione. Riprova.");
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleSign() {
    if (!contract || otp.length !== 6) return;
    setSigning(true);
    setSignError("");
    try {
      const res = await fetch(`/api/contracts/${contract.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpCode: otp, role: "seller" }),
      });
      const data = await res.json();
      if (res.ok) {
        setSigned(true);
        setContract(data.contract);
      } else {
        setSignError(data.error || "Errore durante la firma");
        setOtp("");
      }
    } catch {
      setSignError("Errore di connessione. Riprova.");
    } finally {
      setSigning(false);
    }
  }

  return (
    <DashboardLayout role="seller">
      <div className="space-y-6">
        <h1 className="text-2xl font-light tracking-[-0.03em] text-text">Contratto di Esclusiva</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-bg-soft rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !contract ? (
          <div className="bg-white rounded-xl p-8 border border-border text-center">
            <div className="w-16 h-16 bg-bg-soft rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-primary-dark mb-2">Contratto non ancora disponibile</h3>
            <p className="text-text-muted">
              Il contratto verrà generato dopo che l&apos;agenzia avrà effettuato il sopralluogo del tuo immobile.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Contract details */}
            <div className="bg-white rounded-xl p-6 border border-border">
              <h2 className="font-medium text-primary-dark mb-4">Dettagli Contratto</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-muted">Tipo</p>
                  <p className="font-medium">Esclusiva 90 giorni</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Durata</p>
                  <p className="font-medium">{contract.duration} giorni</p>
                </div>
                {contract.signedAt && (
                  <>
                    <div>
                      <p className="text-sm text-text-muted">Firmato il</p>
                      <p className="font-medium">{formatDate(contract.signedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">Scade il</p>
                      <p className="font-medium">{formatDate(contract.expiresAt)}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Signature status */}
            <div className="bg-white rounded-xl p-6 border border-border">
              <h2 className="font-medium text-primary-dark mb-4">Stato Firme</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border-2 ${contract.sellerSigned ? "border-success bg-success/5" : "border-border"}`}>
                  <div className="flex items-center gap-2">
                    {contract.sellerSigned ? (
                      <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className="font-medium">Venditore</span>
                  </div>
                  <p className="text-sm text-text-muted mt-1">
                    {contract.sellerSigned ? "Firmato" : "In attesa di firma"}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border-2 ${contract.agencySigned ? "border-success bg-success/5" : "border-border"}`}>
                  <div className="flex items-center gap-2">
                    {contract.agencySigned ? (
                      <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className="font-medium">Agenzia</span>
                  </div>
                  <p className="text-sm text-text-muted mt-1">
                    {contract.agencySigned ? "Firmato" : "In attesa di firma"}
                  </p>
                </div>
              </div>
            </div>

            {/* Sign section */}
            {!contract.sellerSigned && !signed && (
              <div className="bg-white rounded-xl p-6 border border-border">
                <h2 className="font-medium text-primary-dark mb-4">Firma il Contratto</h2>
                <p className="text-sm text-text-muted mb-4">
                  Firmando il contratto confermi di voler affidare la vendita del tuo immobile
                  all&apos;agenzia partner assegnata per un periodo di {contract.duration} giorni.
                  La firma avviene tramite OTP inviato alla tua email (art. 1326 c.c.).
                </p>

                <label className="flex items-start gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
                  />
                  <span className="text-sm text-text-muted">
                    Confermo di aver letto e accettato i termini del contratto di esclusiva
                  </span>
                </label>

                {otpError && (
                  <p className="text-sm text-error mb-3">{otpError}</p>
                )}

                {!otpSent ? (
                  <button
                    onClick={handleRequestOtp}
                    disabled={!accepted || otpLoading}
                    className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
                  >
                    {otpLoading ? "Invio in corso..." : "Richiedi codice OTP"}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-success font-medium">
                      Codice OTP inviato alla tua email. Inseriscilo qui sotto. Il codice scade tra 5 minuti.
                    </p>
                    {signError && (
                      <p className="text-sm text-error">{signError}</p>
                    )}
                    <div className="flex gap-3 items-end">
                      <div>
                        <label className="block text-sm font-medium text-text mb-1">Codice OTP</label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="w-40 px-4 py-2.5 border border-border rounded-lg text-center text-lg tracking-widest focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={handleSign}
                        disabled={otp.length !== 6 || signing}
                        className="px-6 py-2.5 bg-success text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-success/85 transition-colors"
                      >
                        {signing ? "Firma in corso..." : "Firma"}
                      </button>
                    </div>
                    <button
                      onClick={() => { setOtpSent(false); setOtp(""); setSignError(""); }}
                      className="text-sm text-primary hover:underline"
                    >
                      Richiedi un nuovo codice
                    </button>
                  </div>
                )}
              </div>
            )}

            {(contract.sellerSigned || signed) && (
              <div className="bg-success/5 border border-success/20 rounded-xl p-6 text-center">
                <svg className="w-12 h-12 text-success mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-lg font-semibold text-success">Contratto firmato</h3>
                <p className="text-sm text-text-muted mt-1">La tua firma è stata registrata con successo.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
