"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalProperties: number;
  publishedProperties: number;
  totalSellers: number;
  totalAgencies: number;
  activeAgencies: number;
  sellerLeads: number;
  agencyLeads: number;
  totalVisits: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [sellerLeads, setSellerLeads] = useState<any[]>([]);
  const [agencyLeads, setAgencyLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "agencies" | "leads" | "assignments">("overview");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [propsRes, agenciesRes, leadsRes] = await Promise.all([
        fetch("/api/admin/properties"),
        fetch("/api/admin/agencies"),
        fetch("/api/admin/leads"),
      ]);

      if (propsRes.ok) {
        const data = await propsRes.json();
        setProperties(data.properties || []);
      }
      if (agenciesRes.ok) {
        const data = await agenciesRes.json();
        setAgencies(data.agencies || []);
      }
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setSellerLeads(data.sellerLeads || []);
        setAgencyLeads(data.agencyLeads || []);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(propertyId: string, slug: string, newStatus: string) {
    try {
      const res = await fetch(`/api/properties/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, publishedAt: newStatus === "PUBLISHED" ? new Date().toISOString() : undefined }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  }

  async function handleAssign(propertyId: string) {
    try {
      const res = await fetch("/api/admin/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Agenzia assegnata con successo!");
        loadData();
      } else {
        alert(data.error || "Errore nell'assegnazione");
      }
    } catch (err) {
      alert("Errore nell'assegnazione");
    }
  }

  const tabs = [
    { id: "overview" as const, label: "Panoramica" },
    { id: "properties" as const, label: "Immobili" },
    { id: "agencies" as const, label: "Agenzie" },
    { id: "leads" as const, label: "Lead" },
    { id: "assignments" as const, label: "Assegnazioni" },
  ];

  const statusLabels: Record<string, string> = {
    DRAFT: "Bozza",
    PENDING_REVIEW: "In Revisione",
    PUBLISHED: "Pubblicato",
    UNDER_CONTRACT: "In Trattativa",
    SOLD: "Venduto",
    WITHDRAWN: "Ritirato",
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING_REVIEW: "bg-amber-100 text-amber-700",
    PUBLISHED: "bg-green-100 text-green-700",
    UNDER_CONTRACT: "bg-blue-100 text-blue-700",
    SOLD: "bg-purple-100 text-purple-700",
    WITHDRAWN: "bg-red-100 text-red-700",
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0a1f44]">Pannello Admin</h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#e2e8f0]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-[#0e8ff1] border-b-2 border-[#0e8ff1]"
                  : "text-[#64748b] hover:text-[#1e293b]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[#f8fafc] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Immobili Totali", value: properties.length, color: "text-[#0e8ff1]" },
                    { label: "Pubblicati", value: properties.filter((p) => p.status === "PUBLISHED").length, color: "text-[#10b981]" },
                    { label: "Agenzie Totali", value: agencies.length, color: "text-[#0a1f44]" },
                    { label: "Agenzie Attive", value: agencies.filter((a: any) => a.isActive).length, color: "text-[#f59e0b]" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border border-[#e2e8f0]">
                      <p className="text-sm text-[#64748b]">{stat.label}</p>
                      <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-5 border border-[#e2e8f0]">
                    <h3 className="font-semibold text-[#0a1f44] mb-3">Immobili Recenti</h3>
                    <div className="space-y-2">
                      {properties.slice(0, 5).map((p: any) => (
                        <div key={p.id} className="flex justify-between items-center py-2 border-b border-[#f8fafc] last:border-0">
                          <div>
                            <p className="text-sm font-medium">{p.title}</p>
                            <p className="text-xs text-[#64748b]">{p.city}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[p.status]}`}>
                            {statusLabels[p.status]}
                          </span>
                        </div>
                      ))}
                      {properties.length === 0 && (
                        <p className="text-sm text-[#64748b]">Nessun immobile inserito.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-[#e2e8f0]">
                    <h3 className="font-semibold text-[#0a1f44] mb-3">Agenzie Recenti</h3>
                    <div className="space-y-2">
                      {agencies.slice(0, 5).map((a: any) => (
                        <div key={a.id} className="flex justify-between items-center py-2 border-b border-[#f8fafc] last:border-0">
                          <div>
                            <p className="text-sm font-medium">{a.name}</p>
                            <p className="text-xs text-[#64748b]">{a.city} ({a.province})</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${a.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                            {a.isActive ? "Attiva" : "Inattiva"}
                          </span>
                        </div>
                      ))}
                      {agencies.length === 0 && (
                        <p className="text-sm text-[#64748b]">Nessuna agenzia registrata.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Properties */}
            {activeTab === "properties" && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e2e8f0]">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Immobile</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Venditore</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Prezzo</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Stato</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Agenzia</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((p: any) => (
                        <tr key={p.id} className="border-b border-[#f8fafc] hover:bg-[#f8fafc]">
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium">{p.title}</p>
                            <p className="text-xs text-[#64748b]">{p.city} ({p.province})</p>
                          </td>
                          <td className="py-3 px-4 text-sm">{p.seller?.name || "—"}</td>
                          <td className="py-3 px-4 text-sm font-semibold">{formatPrice(p.price)}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[p.status]}`}>
                              {statusLabels[p.status]}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{p.assignment?.agency?.name || "Non assegnata"}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {p.status === "DRAFT" && (
                                <button
                                  onClick={() => handleStatusChange(p.id, p.slug, "PENDING_REVIEW")}
                                  className="text-xs px-3 py-1 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
                                >
                                  Revisiona
                                </button>
                              )}
                              {p.status === "PENDING_REVIEW" && (
                                <button
                                  onClick={() => handleStatusChange(p.id, p.slug, "PUBLISHED")}
                                  className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                >
                                  Pubblica
                                </button>
                              )}
                              {!p.assignment && (
                                <button
                                  onClick={() => handleAssign(p.id)}
                                  className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                                >
                                  Assegna
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {properties.length === 0 && (
                    <p className="text-center py-8 text-[#64748b]">Nessun immobile.</p>
                  )}
                </div>
              </div>
            )}

            {/* Agencies */}
            {activeTab === "agencies" && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#e2e8f0]">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Agenzia</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Città</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Piano</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Immobili</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Stato</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agencies.map((a: any) => (
                        <tr key={a.id} className="border-b border-[#f8fafc] hover:bg-[#f8fafc]">
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium">{a.name}</p>
                            <p className="text-xs text-[#64748b]">{a.email}</p>
                          </td>
                          <td className="py-3 px-4 text-sm">{a.city} ({a.province})</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${a.plan === "PRO" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}>
                              {a.plan}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{a._count?.assignments || 0}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${a.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {a.isActive ? "Attiva" : "Inattiva"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {agencies.length === 0 && (
                    <p className="text-center py-8 text-[#64748b]">Nessuna agenzia registrata.</p>
                  )}
                </div>
              </div>
            )}

            {/* Leads */}
            {activeTab === "leads" && (
              <div className="space-y-6">
                {/* Lead Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Lead Venditori", value: sellerLeads.length, color: "text-[#0e8ff1]" },
                    { label: "Lead Agenzie", value: agencyLeads.length, color: "text-[#0a1f44]" },
                    { label: "Nuovi (Venditori)", value: sellerLeads.filter((l: any) => l.status === "NEW").length, color: "text-[#10b981]" },
                    { label: "Nuovi (Agenzie)", value: agencyLeads.filter((l: any) => l.status === "NEW").length, color: "text-[#f59e0b]" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border border-[#e2e8f0]">
                      <p className="text-sm text-[#64748b]">{stat.label}</p>
                      <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Seller Leads Table */}
                <div className="bg-white rounded-xl border border-[#e2e8f0]">
                  <div className="p-5 border-b border-[#e2e8f0]">
                    <h3 className="font-semibold text-[#0a1f44]">Lead Venditori</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#e2e8f0]">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Nome</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Telefono</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Zona</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Stato</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sellerLeads.map((lead: any) => (
                          <tr key={lead.id} className="border-b border-[#f8fafc] hover:bg-[#f8fafc]">
                            <td className="py-3 px-4 text-sm font-medium">{lead.name}</td>
                            <td className="py-3 px-4 text-sm text-[#64748b]">{lead.email}</td>
                            <td className="py-3 px-4 text-sm">{lead.phone}</td>
                            <td className="py-3 px-4 text-sm">{lead.city} ({lead.province})</td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                lead.status === "NEW" ? "bg-green-100 text-green-700" :
                                lead.status === "CONTACTED" ? "bg-blue-100 text-blue-700" :
                                lead.status === "CONVERTED" ? "bg-purple-100 text-purple-700" :
                                lead.status === "LOST" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {lead.status === "NEW" ? "Nuovo" :
                                 lead.status === "CONTACTED" ? "Contattato" :
                                 lead.status === "ONBOARDING" ? "Onboarding" :
                                 lead.status === "CONVERTED" ? "Convertito" :
                                 lead.status === "LOST" ? "Perso" : lead.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-[#64748b]">
                              {new Date(lead.createdAt).toLocaleDateString("it-IT")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {sellerLeads.length === 0 && (
                      <p className="text-center py-8 text-[#64748b]">Nessun lead venditore.</p>
                    )}
                  </div>
                </div>

                {/* Agency Leads Table */}
                <div className="bg-white rounded-xl border border-[#e2e8f0]">
                  <div className="p-5 border-b border-[#e2e8f0]">
                    <h3 className="font-semibold text-[#0a1f44]">Lead Agenzie</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#e2e8f0]">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Agenzia</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Contatto</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Zona</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Stato</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748b]">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agencyLeads.map((lead: any) => (
                          <tr key={lead.id} className="border-b border-[#f8fafc] hover:bg-[#f8fafc]">
                            <td className="py-3 px-4 text-sm font-medium">{lead.agencyName}</td>
                            <td className="py-3 px-4 text-sm">{lead.contactName}</td>
                            <td className="py-3 px-4 text-sm text-[#64748b]">{lead.email}</td>
                            <td className="py-3 px-4 text-sm">{lead.city} ({lead.province})</td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                lead.status === "NEW" ? "bg-green-100 text-green-700" :
                                lead.status === "CONTACTED" ? "bg-blue-100 text-blue-700" :
                                lead.status === "CONVERTED" ? "bg-purple-100 text-purple-700" :
                                lead.status === "LOST" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {lead.status === "NEW" ? "Nuovo" :
                                 lead.status === "CONTACTED" ? "Contattato" :
                                 lead.status === "ONBOARDING" ? "Onboarding" :
                                 lead.status === "CONVERTED" ? "Convertito" :
                                 lead.status === "LOST" ? "Perso" : lead.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-[#64748b]">
                              {new Date(lead.createdAt).toLocaleDateString("it-IT")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {agencyLeads.length === 0 && (
                      <p className="text-center py-8 text-[#64748b]">Nessun lead agenzia.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Assignments */}
            {activeTab === "assignments" && (
              <div className="space-y-4">
                <p className="text-sm text-[#64748b]">
                  Immobili senza agenzia assegnata. Clicca &quot;Auto-Assegna&quot; per avviare il matchmaking automatico.
                </p>
                <div className="space-y-3">
                  {properties
                    .filter((p: any) => !p.assignment)
                    .map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#e2e8f0]">
                        <div>
                          <p className="font-medium">{p.title}</p>
                          <p className="text-sm text-[#64748b]">{p.city} — {formatPrice(p.price)}</p>
                        </div>
                        <button
                          onClick={() => handleAssign(p.id)}
                          className="px-4 py-2 bg-[#0e8ff1] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f44] transition-colors"
                        >
                          Auto-Assegna
                        </button>
                      </div>
                    ))}
                  {properties.filter((p: any) => !p.assignment).length === 0 && (
                    <p className="text-center py-8 text-[#64748b]">Tutti gli immobili sono assegnati.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
