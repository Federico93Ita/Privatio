"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatPrice } from "@/lib/utils";

interface BillingData {
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale: string;
  pec: string;
  codiceSdi: string;
  invoiceAddress: string;
  invoiceCity: string;
  invoiceProvince: string;
  invoiceCap: string;
}

const emptyBilling: BillingData = {
  ragioneSociale: "",
  partitaIva: "",
  codiceFiscale: "",
  pec: "",
  codiceSdi: "",
  invoiceAddress: "",
  invoiceCity: "",
  invoiceProvince: "",
  invoiceCap: "",
};

export default function AgencyBillingPage() {
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Billing form state
  const [billing, setBilling] = useState<BillingData>(emptyBilling);
  const [billingLoading, setBillingLoading] = useState(true);
  const [billingSaving, setBillingSaving] = useState(false);
  const [billingSaved, setBillingSaved] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Load agency data
    fetch("/api/dashboard/agency")
      .then((r) => r.json())
      .then((data) => setAgency(data.agency))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Load billing data
    fetch("/api/dashboard/agency/billing")
      .then((r) => r.json())
      .then((data) => {
        if (data.billing) {
          setBilling({
            ragioneSociale: data.billing.ragioneSociale || "",
            partitaIva: data.billing.partitaIva || "",
            codiceFiscale: data.billing.codiceFiscale || "",
            pec: data.billing.pec || "",
            codiceSdi: data.billing.codiceSdi || "",
            invoiceAddress: data.billing.invoiceAddress || "",
            invoiceCity: data.billing.invoiceCity || "",
            invoiceProvince: data.billing.invoiceProvince || "",
            invoiceCap: data.billing.invoiceCap || "",
          });
        }
      })
      .catch(console.error)
      .finally(() => setBillingLoading(false));
  }, []);

  async function handleSubscribe(plan: "BASE" | "PRO") {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleSaveBilling() {
    setBillingSaving(true);
    setBillingError(null);
    setFieldErrors({});
    try {
      const res = await fetch("/api/dashboard/agency/billing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billing),
      });
      const data = await res.json();
      if (!res.ok) {
        setBillingError(data.error || "Errore nel salvataggio");
        if (data.details) setFieldErrors(data.details);
        return;
      }
      setBillingSaved(true);
      setTimeout(() => setBillingSaved(false), 3000);
    } catch {
      setBillingError("Errore di connessione. Riprova.");
    } finally {
      setBillingSaving(false);
    }
  }

  function updateField(field: keyof BillingData, value: string) {
    setBilling((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  const completedSales =
    agency?.assignments?.filter((a: any) => a.status === "COMPLETED") || [];

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
      fieldErrors[field]?.length
        ? "border-error/30 focus:ring-error/20"
        : "border-border focus:ring-primary/30/30"
    }`;

  return (
    <DashboardLayout role="agency">
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-light tracking-[-0.03em] text-text">Fatturazione</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-bg-soft rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Current plan */}
            <div className="bg-white rounded-xl p-6 border border-border">
              <h2 className="font-medium text-primary-dark mb-4">
                Piano Attuale
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        agency?.plan === "PRO"
                          ? "bg-primary/10 text-primary"
                          : "bg-bg-soft text-text-muted"
                      }`}
                    >
                      Piano {agency?.plan || "—"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        agency?.isActive
                          ? "bg-success/10 text-success"
                          : "bg-error/10 text-error"
                      }`}
                    >
                      {agency?.isActive ? "Attivo" : "Non attivo"}
                    </span>
                  </div>
                  <p className="text-text-muted mt-2">
                    {agency?.plan === "PRO"
                      ? "Immobili illimitati — €99/mese"
                      : "Max 5 immobili — €49/mese"}
                  </p>
                </div>
                {!agency?.isActive && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSubscribe("BASE")}
                      disabled={checkoutLoading}
                      className="px-5 py-2.5 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition-colors disabled:opacity-50"
                    >
                      Base — €49/mese
                    </button>
                    <button
                      onClick={() => handleSubscribe("PRO")}
                      disabled={checkoutLoading}
                      className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/85 transition-colors disabled:opacity-50"
                    >
                      Pro — €99/mese
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Fatturazione Elettronica */}
            <div className="bg-white rounded-xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-medium text-primary-dark">
                  Dati Fatturazione Elettronica
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">
                  SDI
                </span>
              </div>
              <p className="text-sm text-text-muted mb-5">
                Inserisci i dati per la ricezione delle fatture elettroniche
                tramite il Sistema di Interscambio (SDI).
              </p>

              {billingLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-10 bg-bg-soft rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Ragione Sociale */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Ragione Sociale <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={billing.ragioneSociale}
                      onChange={(e) =>
                        updateField("ragioneSociale", e.target.value)
                      }
                      placeholder="Es. Immobiliare San Giorgio S.r.l."
                      className={inputClass("ragioneSociale")}
                    />
                    {fieldErrors.ragioneSociale && (
                      <p className="text-xs text-error mt-1">
                        {fieldErrors.ragioneSociale[0]}
                      </p>
                    )}
                  </div>

                  {/* P.IVA + Codice Fiscale */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Partita IVA <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={billing.partitaIva}
                        onChange={(e) =>
                          updateField(
                            "partitaIva",
                            e.target.value.replace(/\D/g, "").slice(0, 11)
                          )
                        }
                        placeholder="12345678901"
                        maxLength={11}
                        className={inputClass("partitaIva")}
                      />
                      {fieldErrors.partitaIva && (
                        <p className="text-xs text-error mt-1">
                          {fieldErrors.partitaIva[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Codice Fiscale <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={billing.codiceFiscale}
                        onChange={(e) =>
                          updateField(
                            "codiceFiscale",
                            e.target.value.toUpperCase().slice(0, 16)
                          )
                        }
                        placeholder="12345678901 o RSSMRA80A01H501Z"
                        maxLength={16}
                        className={inputClass("codiceFiscale")}
                      />
                      {fieldErrors.codiceFiscale && (
                        <p className="text-xs text-error mt-1">
                          {fieldErrors.codiceFiscale[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* PEC + Codice SDI */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        PEC
                        <span className="text-text-muted font-normal ml-1">
                          (o Codice SDI)
                        </span>
                      </label>
                      <input
                        type="email"
                        value={billing.pec}
                        onChange={(e) => updateField("pec", e.target.value)}
                        placeholder="agenzia@pec.it"
                        className={inputClass("pec")}
                      />
                      {fieldErrors.pec && (
                        <p className="text-xs text-error mt-1">
                          {fieldErrors.pec[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Codice SDI
                        <span className="text-text-muted font-normal ml-1">
                          (o PEC)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={billing.codiceSdi}
                        onChange={(e) =>
                          updateField(
                            "codiceSdi",
                            e.target.value.toUpperCase().slice(0, 7)
                          )
                        }
                        placeholder="0000000"
                        maxLength={7}
                        className={inputClass("codiceSdi")}
                      />
                      {fieldErrors.codiceSdi && (
                        <p className="text-xs text-error mt-1">
                          {fieldErrors.codiceSdi[0]}
                        </p>
                      )}
                      <p className="text-[10px] text-text-muted mt-1">
                        Inserisci almeno uno tra PEC e Codice SDI
                      </p>
                    </div>
                  </div>

                  {/* Indirizzo Sede Legale */}
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Indirizzo Sede Legale{" "}
                      <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={billing.invoiceAddress}
                      onChange={(e) =>
                        updateField("invoiceAddress", e.target.value)
                      }
                      placeholder="Via Roma 15"
                      className={inputClass("invoiceAddress")}
                    />
                    {fieldErrors.invoiceAddress && (
                      <p className="text-xs text-error mt-1">
                        {fieldErrors.invoiceAddress[0]}
                      </p>
                    )}
                  </div>

                  {/* Città + Provincia + CAP */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Città <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={billing.invoiceCity}
                        onChange={(e) =>
                          updateField("invoiceCity", e.target.value)
                        }
                        placeholder="Milano"
                        className={inputClass("invoiceCity")}
                      />
                      {fieldErrors.invoiceCity && (
                        <p className="text-xs text-error mt-1">
                          {fieldErrors.invoiceCity[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Provincia <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={billing.invoiceProvince}
                        onChange={(e) =>
                          updateField(
                            "invoiceProvince",
                            e.target.value.toUpperCase().slice(0, 2)
                          )
                        }
                        placeholder="MI"
                        maxLength={2}
                        className={inputClass("invoiceProvince")}
                      />
                      {fieldErrors.invoiceProvince && (
                        <p className="text-xs text-error mt-1">
                          {fieldErrors.invoiceProvince[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        CAP <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={billing.invoiceCap}
                        onChange={(e) =>
                          updateField(
                            "invoiceCap",
                            e.target.value.replace(/\D/g, "").slice(0, 5)
                          )
                        }
                        placeholder="20121"
                        maxLength={5}
                        className={inputClass("invoiceCap")}
                      />
                      {fieldErrors.invoiceCap && (
                        <p className="text-xs text-error mt-1">
                          {fieldErrors.invoiceCap[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Save button */}
                  <div className="flex items-center gap-4 pt-2">
                    <button
                      onClick={handleSaveBilling}
                      disabled={billingSaving}
                      className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/85 transition-colors"
                    >
                      {billingSaving
                        ? "Salvataggio..."
                        : "Salva dati fatturazione"}
                    </button>
                    {billingSaved && (
                      <p className="text-sm text-success font-medium">
                        Dati salvati correttamente!
                      </p>
                    )}
                    {billingError && (
                      <p className="text-sm text-error font-medium">
                        {billingError}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Commissions */}
            <div className="bg-white rounded-xl p-6 border border-border">
              <h2 className="font-medium text-primary-dark mb-4">
                Provvigioni Maturate
              </h2>
              {completedSales.length === 0 ? (
                <p className="text-text-muted text-center py-4">
                  Nessuna vendita completata ancora.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-3 text-sm font-semibold text-text-muted">
                          Immobile
                        </th>
                        <th className="text-left py-3 px-3 text-sm font-semibold text-text-muted">
                          Prezzo Vendita
                        </th>
                        <th className="text-left py-3 px-3 text-sm font-semibold text-text-muted">
                          Provvigione (1.5%)
                        </th>
                        <th className="text-left py-3 px-3 text-sm font-semibold text-text-muted">
                          Stato
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedSales.map((sale: any) => (
                        <tr key={sale.id} className="border-b border-border">
                          <td className="py-3 px-3 text-sm">
                            {sale.property.title}
                          </td>
                          <td className="py-3 px-3 text-sm font-semibold">
                            {formatPrice(sale.property.price)}
                          </td>
                          <td className="py-3 px-3 text-sm font-semibold text-success">
                            {formatPrice(
                              Math.round(sale.property.price * 0.015)
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                              In attesa
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
