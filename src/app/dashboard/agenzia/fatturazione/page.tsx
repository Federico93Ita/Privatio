"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatPrice } from "@/lib/utils";

export default function AgencyBillingPage() {
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/agency")
      .then((r) => r.json())
      .then((data) => setAgency(data.agency))
      .catch(console.error)
      .finally(() => setLoading(false));
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

  const completedSales = agency?.assignments?.filter((a: any) => a.status === "COMPLETED") || [];

  return (
    <DashboardLayout role="agency">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0a1f44]">Fatturazione</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-32 bg-[#f8fafc] rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Current plan */}
            <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
              <h2 className="font-semibold text-[#0a1f44] mb-4">Piano Attuale</h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      agency?.plan === "PRO" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      Piano {agency?.plan || "—"}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      agency?.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {agency?.isActive ? "Attivo" : "Non attivo"}
                    </span>
                  </div>
                  <p className="text-[#64748b] mt-2">
                    {agency?.plan === "PRO" ? "Immobili illimitati — €99/mese" : "Max 5 immobili — €49/mese"}
                  </p>
                </div>
                {!agency?.isActive && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSubscribe("BASE")}
                      disabled={checkoutLoading}
                      className="px-5 py-2.5 border border-[#0e8ff1] text-[#0e8ff1] rounded-lg font-medium hover:bg-[#0e8ff1]/5 transition-colors disabled:opacity-50"
                    >
                      Base — €49/mese
                    </button>
                    <button
                      onClick={() => handleSubscribe("PRO")}
                      disabled={checkoutLoading}
                      className="px-5 py-2.5 bg-[#0e8ff1] text-white rounded-lg font-medium hover:bg-[#0a1f44] transition-colors disabled:opacity-50"
                    >
                      Pro — €99/mese
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Commissions */}
            <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
              <h2 className="font-semibold text-[#0a1f44] mb-4">Provvigioni Maturate</h2>
              {completedSales.length === 0 ? (
                <p className="text-[#64748b] text-center py-4">Nessuna vendita completata ancora.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e2e8f0]">
                        <th className="text-left py-3 px-3 text-sm font-semibold text-[#64748b]">Immobile</th>
                        <th className="text-left py-3 px-3 text-sm font-semibold text-[#64748b]">Prezzo Vendita</th>
                        <th className="text-left py-3 px-3 text-sm font-semibold text-[#64748b]">Provvigione (1.5%)</th>
                        <th className="text-left py-3 px-3 text-sm font-semibold text-[#64748b]">Stato</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedSales.map((sale: any) => (
                        <tr key={sale.id} className="border-b border-[#f8fafc]">
                          <td className="py-3 px-3 text-sm">{sale.property.title}</td>
                          <td className="py-3 px-3 text-sm font-semibold">{formatPrice(sale.property.price)}</td>
                          <td className="py-3 px-3 text-sm font-semibold text-[#10b981]">
                            {formatPrice(Math.round(sale.property.price * 0.015))}
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">In attesa</span>
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
