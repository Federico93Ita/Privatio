"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

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
    coverageRadius: 15,
  });

  useEffect(() => {
    fetch("/api/dashboard/agency")
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
            coverageRadius: data.agency.coverageRadius || 15,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    // In production: PUT /api/agency/[id]
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  }

  return (
    <DashboardLayout role="agency">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-[#0a1f44]">Impostazioni Agenzia</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-32 bg-[#f8fafc] rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Agency profile */}
            <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
              <h2 className="font-semibold text-[#0a1f44] mb-4">Profilo Agenzia</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-1">Nome agenzia</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e8ff1]" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1e293b] mb-1">Telefono</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e8ff1]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1e293b] mb-1">Email</label>
                    <input type="email" value={agency?.email || ""} disabled
                      className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#64748b]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-1">Indirizzo</label>
                  <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e8ff1]" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1e293b] mb-1">Città</label>
                    <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e8ff1]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1e293b] mb-1">Provincia</label>
                    <input type="text" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} maxLength={2}
                      className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e8ff1]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-1">Descrizione</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4}
                    className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e8ff1] resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1e293b] mb-1">
                    Raggio di copertura: {form.coverageRadius} km
                  </label>
                  <input type="range" min={5} max={50} value={form.coverageRadius}
                    onChange={(e) => setForm({ ...form, coverageRadius: parseInt(e.target.value) })}
                    className="w-full accent-[#0e8ff1]" />
                  <div className="flex justify-between text-xs text-[#64748b]">
                    <span>5 km</span><span>50 km</span>
                  </div>
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="px-6 py-2.5 bg-[#0e8ff1] text-white rounded-lg font-medium disabled:opacity-50 hover:bg-[#0a1f44] transition-colors">
                  {saving ? "Salvataggio..." : "Salva modifiche"}
                </button>
                {saved && <p className="text-sm text-[#10b981] font-medium">Modifiche salvate!</p>}
              </div>
            </div>

            {/* Team */}
            <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
              <h2 className="font-semibold text-[#0a1f44] mb-4">Team Agenti</h2>
              {agency?.agents?.length > 0 ? (
                <div className="space-y-3">
                  {agency.agents.map((agent: any) => (
                    <div key={agent.id} className="flex items-center justify-between py-2 border-b border-[#f8fafc] last:border-0">
                      <div>
                        <p className="font-medium text-[#1e293b]">{agent.name}</p>
                        <p className="text-sm text-[#64748b]">{agent.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#64748b] text-sm">Nessun agente nel team.</p>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
