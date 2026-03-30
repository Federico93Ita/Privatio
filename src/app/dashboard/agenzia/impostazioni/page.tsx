"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TwoFactorSetup from "@/components/auth/TwoFactorSetup";

export default function AgencySettingsPage() {
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    description: "",
  });

  useEffect(() => {
    fetch("/api/dashboard/agency/stats")
      .then((r) => r.json())
      .then((data) => {
        setAgency(data.agency);
        if (data.agency) {
          setForm({
            name: data.agency.name || "",
            phone: data.agency.phone || "",
            address: data.agency.address || "",
            city: data.agency.city || "",
            province: data.agency.province || "",
            description: data.agency.description || "",
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Fetch 2FA status
  useEffect(() => {
    fetch("/api/auth/two-factor/status")
      .then((r) => r.json())
      .then((data) => setTwoFactorEnabled(data.enabled || false))
      .catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/agency/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore nel salvataggio");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Errore di connessione. Riprova.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout role="agency">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-light tracking-[-0.03em] text-text">Impostazioni Agenzia</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-32 bg-bg-soft rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Agency profile */}
            <div className="bg-white rounded-xl p-6 border border-border">
              <h2 className="font-medium text-primary-dark mb-4">Profilo Agenzia</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Nome agenzia</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Telefono</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Email</label>
                    <input type="email" value={agency?.email || ""} disabled
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-bg-soft text-text-muted" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Indirizzo</label>
                  <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Città</label>
                    <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Provincia</label>
                    <input type="text" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} maxLength={2}
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Descrizione</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4}
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none" />
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/85 transition-colors">
                  {saving ? "Salvataggio..." : "Salva modifiche"}
                </button>
                {saved && <p className="text-sm text-success font-medium">Modifiche salvate!</p>}
                {error && <p className="text-sm text-error font-medium">{error}</p>}
              </div>
            </div>

            {/* 2FA */}
            <TwoFactorSetup
              isEnabled={twoFactorEnabled}
              onStatusChange={setTwoFactorEnabled}
            />

            {/* Team */}
            <div className="bg-white rounded-xl p-6 border border-border">
              <h2 className="font-medium text-primary-dark mb-4">Team Agenti</h2>
              {agency?.agents?.length > 0 ? (
                <div className="space-y-3">
                  {agency.agents.map((agent: any) => (
                    <div key={agent.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-text">{agent.name}</p>
                        <p className="text-sm text-text-muted">{agent.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm">Nessun agente nel team.</p>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
