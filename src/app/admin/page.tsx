"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatPrice } from "@/lib/utils";
import PropertyEditModal from "@/components/admin/PropertyEditModal";
import AgencyEditModal from "@/components/admin/AgencyEditModal";
import UserEditModal from "@/components/admin/UserEditModal";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

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
  const [users, setUsers] = useState<any[]>([]);
  const [sellerLeads, setSellerLeads] = useState<any[]>([]);
  const [agencyLeads, setAgencyLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "agencies" | "users" | "leads" | "assignments" | "territories">("overview");
  const searchParams = useSearchParams();

  // Modal state
  const [editingProperty, setEditingProperty] = useState<any | null>(null);
  const [editingAgency, setEditingAgency] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: string; id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Read initial tab from URL query param
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "properties" || tab === "agencies" || tab === "users" || tab === "leads" || tab === "assignments" || tab === "territories") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [propsRes, agenciesRes, leadsRes, zonesRes, usersRes] = await Promise.all([
        fetch("/api/admin/properties"),
        fetch("/api/admin/agencies"),
        fetch("/api/admin/leads"),
        fetch("/api/admin/zones"),
        fetch("/api/admin/users"),
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
      if (zonesRes.ok) {
        const data = await zonesRes.json();
        setZones(data.zones || []);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
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

  async function handleLeadAction(leadId: string, action: "approve" | "reject") {
    if (action === "reject" && !window.confirm("Sei sicuro di voler rifiutare questa agenzia?")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/leads/agency/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(action === "approve" ? "Agenzia approvata! Email inviata." : "Agenzia rifiutata. Email inviata.");
        loadData();
      } else {
        alert(data.error || "Errore");
      }
    } catch (err) {
      alert("Errore nell'operazione");
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
        alert("Agenzia collegata con successo!");
        loadData();
      } else {
        alert(data.error || "Errore nel collegamento");
      }
    } catch (err) {
      alert("Errore nell'assegnazione");
    }
  }

  async function handleToggleAgencyActive(agency: any) {
    try {
      const res = await fetch(`/api/admin/agencies/${agency.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !agency.isActive }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Error toggling agency:", err);
    }
  }

  async function handleDelete() {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      let url = "";
      if (deletingItem.type === "property") {
        url = `/api/properties/${deletingItem.id}`;
      } else if (deletingItem.type === "agency") {
        url = `/api/admin/agencies/${deletingItem.id}`;
      } else if (deletingItem.type === "user") {
        url = `/api/admin/users/${deletingItem.id}`;
      }
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        loadData();
        setDeletingItem(null);
      } else {
        const data = await res.json();
        alert(data.error || "Errore durante l'eliminazione");
      }
    } catch (err) {
      alert("Errore di rete");
    } finally {
      setDeleteLoading(false);
    }
  }

  const tabs = [
    { id: "overview" as const, label: "Panoramica" },
    { id: "properties" as const, label: "Immobili" },
    { id: "agencies" as const, label: "Agenzie" },
    { id: "users" as const, label: "Utenti" },
    { id: "leads" as const, label: "Lead" },
    { id: "assignments" as const, label: "Assegnazioni" },
    { id: "territories" as const, label: "Territori" },
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
    DRAFT: "bg-bg-soft text-text-muted",
    PENDING_REVIEW: "bg-accent/10 text-accent",
    PUBLISHED: "bg-success/10 text-success",
    UNDER_CONTRACT: "bg-primary/10 text-primary",
    SOLD: "bg-primary/10 text-primary",
    WITHDRAWN: "bg-error/10 text-error",
  };

  const roleLabels: Record<string, string> = {
    SELLER: "Venditore",
    BUYER: "Acquirente",
    AGENCY_ADMIN: "Admin Agenzia",
    AGENCY_AGENT: "Agente",
    ADMIN: "Amministratore",
  };

  const roleColors: Record<string, string> = {
    SELLER: "bg-primary/10 text-primary",
    BUYER: "bg-accent/10 text-accent",
    AGENCY_ADMIN: "bg-success/10 text-success",
    AGENCY_AGENT: "bg-success/10 text-success",
    ADMIN: "bg-red-100 text-red-700",
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <h1 className="text-2xl font-light tracking-[-0.03em] text-text">Pannello Admin</h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-primary border-b-2 border-primary"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-bg-soft rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Immobili Totali", value: properties.length, color: "text-primary" },
                    { label: "Pubblicati", value: properties.filter((p) => p.status === "PUBLISHED").length, color: "text-success" },
                    { label: "Agenzie Totali", value: agencies.length, color: "text-primary-dark" },
                    { label: "Utenti Totali", value: users.length, color: "text-accent" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border border-border">
                      <p className="text-sm text-text-muted">{stat.label}</p>
                      <p className={`text-3xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-5 border border-border">
                    <h3 className="font-medium text-primary-dark mb-3">Immobili Recenti</h3>
                    <div className="space-y-2">
                      {properties.slice(0, 5).map((p: any) => (
                        <div key={p.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                          <div>
                            <p className="text-sm font-medium">{p.title}</p>
                            <p className="text-xs text-text-muted">{p.city}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[p.status]}`}>
                            {statusLabels[p.status]}
                          </span>
                        </div>
                      ))}
                      {properties.length === 0 && (
                        <p className="text-sm text-text-muted">Nessun immobile inserito.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-border">
                    <h3 className="font-medium text-primary-dark mb-3">Agenzie Recenti</h3>
                    <div className="space-y-2">
                      {agencies.slice(0, 5).map((a: any) => (
                        <div key={a.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                          <div>
                            <p className="text-sm font-medium">{a.name}</p>
                            <p className="text-xs text-text-muted">{a.city} ({a.province})</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${a.isActive ? "bg-success/10 text-success" : "bg-bg-soft text-text-muted"}`}>
                            {a.isActive ? "Attiva" : "Inattiva"}
                          </span>
                        </div>
                      ))}
                      {agencies.length === 0 && (
                        <p className="text-sm text-text-muted">Nessuna agenzia registrata.</p>
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
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Immobile</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Venditore</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Prezzo</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Stato</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Agenzia</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((p: any) => (
                        <tr key={p.id} className="border-b border-border hover:bg-bg-soft">
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium">{p.title}</p>
                            <p className="text-xs text-text-muted">{p.city} ({p.province})</p>
                          </td>
                          <td className="py-3 px-4 text-sm">{p.seller?.name || "—"}</td>
                          <td className="py-3 px-4 text-sm font-semibold">{formatPrice(p.price)}</td>
                          <td className="py-3 px-4">
                            <select
                              value={p.status}
                              onChange={(e) => handleStatusChange(p.id, p.slug, e.target.value)}
                              className={`text-xs px-2 py-1 rounded-lg border-0 cursor-pointer font-medium ${statusColors[p.status]}`}
                            >
                              {Object.entries(statusLabels).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4 text-sm">{p.assignment?.agency?.name || "Non assegnata"}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setEditingProperty(p)}
                                className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 font-medium"
                              >
                                Modifica
                              </button>
                              {!p.assignment && (
                                <button
                                  onClick={() => handleAssign(p.id)}
                                  className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 font-medium"
                                >
                                  Assegna
                                </button>
                              )}
                              <button
                                onClick={() => setDeletingItem({ type: "property", id: p.slug, name: p.title })}
                                className="text-xs px-3 py-1 bg-error/10 text-error rounded-lg hover:bg-error/20 font-medium"
                              >
                                Elimina
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {properties.length === 0 && (
                    <p className="text-center py-8 text-text-muted">Nessun immobile.</p>
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
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Agenzia</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Città</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Piano</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Immobili</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Stato</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agencies.map((a: any) => (
                        <tr key={a.id} className="border-b border-border hover:bg-bg-soft">
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium">{a.name}</p>
                            <p className="text-xs text-text-muted">{a.email}</p>
                          </td>
                          <td className="py-3 px-4 text-sm">{a.city} ({a.province})</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${a.plan !== "BASE" ? "bg-primary/10 text-primary" : "bg-bg-soft text-text-muted"}`}>
                              {a.plan?.replace(/_/g, " ") || "BASE"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{a._count?.assignments || 0}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleAgencyActive(a)}
                              className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer transition-colors ${a.isActive ? "bg-success/10 text-success hover:bg-success/20" : "bg-error/10 text-error hover:bg-error/20"}`}
                            >
                              {a.isActive ? "Attiva" : "Inattiva"}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setEditingAgency(a)}
                                className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 font-medium"
                              >
                                Modifica
                              </button>
                              <button
                                onClick={() => setDeletingItem({ type: "agency", id: a.id, name: a.name })}
                                className="text-xs px-3 py-1 bg-error/10 text-error rounded-lg hover:bg-error/20 font-medium"
                              >
                                Elimina
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {agencies.length === 0 && (
                    <p className="text-center py-8 text-text-muted">Nessuna agenzia registrata.</p>
                  )}
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === "users" && (
              <div className="space-y-4">
                {/* User Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Totali", value: users.length, color: "text-primary" },
                    { label: "Venditori", value: users.filter((u: any) => u.role === "SELLER").length, color: "text-primary-dark" },
                    { label: "Acquirenti", value: users.filter((u: any) => u.role === "BUYER").length, color: "text-accent" },
                    { label: "Agenzie", value: users.filter((u: any) => u.role === "AGENCY_ADMIN" || u.role === "AGENCY_AGENT").length, color: "text-success" },
                    { label: "Admin", value: users.filter((u: any) => u.role === "ADMIN").length, color: "text-red-600" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-border">
                      <p className="text-xs text-text-muted">{stat.label}</p>
                      <p className={`text-2xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Utente</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Ruolo</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Registrazione</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Immobili</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Agenzia</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u: any) => (
                        <tr key={u.id} className="border-b border-border hover:bg-bg-soft">
                          <td className="py-3 px-4">
                            <p className="text-sm font-medium">{u.name || "—"}</p>
                            {u.phone && <p className="text-xs text-text-muted">{u.phone}</p>}
                          </td>
                          <td className="py-3 px-4 text-sm text-text-muted">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors[u.role] || "bg-bg-soft text-text-muted"}`}>
                              {roleLabels[u.role] || u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-text-muted">
                            {new Date(u.createdAt).toLocaleDateString("it-IT")}
                          </td>
                          <td className="py-3 px-4 text-sm">{u._count?.properties || 0}</td>
                          <td className="py-3 px-4 text-sm">{u.agency?.name || "—"}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setEditingUser(u)}
                                className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 font-medium"
                              >
                                Modifica
                              </button>
                              <button
                                onClick={() => setDeletingItem({ type: "user", id: u.id, name: u.name || u.email })}
                                className="text-xs px-3 py-1 bg-error/10 text-error rounded-lg hover:bg-error/20 font-medium"
                              >
                                Elimina
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <p className="text-center py-8 text-text-muted">Nessun utente registrato.</p>
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
                    { label: "Lead Venditori", value: sellerLeads.length, color: "text-primary" },
                    { label: "Lead Agenzie", value: agencyLeads.length, color: "text-primary-dark" },
                    { label: "Nuovi (Venditori)", value: sellerLeads.filter((l: any) => l.status === "NEW").length, color: "text-success" },
                    { label: "Nuovi (Agenzie)", value: agencyLeads.filter((l: any) => l.status === "NEW").length, color: "text-accent" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border border-border">
                      <p className="text-sm text-text-muted">{stat.label}</p>
                      <p className={`text-3xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Seller Leads Table */}
                <div className="bg-white rounded-xl border border-border">
                  <div className="p-5 border-b border-border">
                    <h3 className="font-medium text-primary-dark">Lead Venditori</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Nome</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Telefono</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Zona</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Stato</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sellerLeads.map((lead: any) => (
                          <tr key={lead.id} className="border-b border-border hover:bg-bg-soft">
                            <td className="py-3 px-4 text-sm font-medium">{lead.name}</td>
                            <td className="py-3 px-4 text-sm text-text-muted">{lead.email}</td>
                            <td className="py-3 px-4 text-sm">{lead.phone}</td>
                            <td className="py-3 px-4 text-sm">{lead.city} ({lead.province})</td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                lead.status === "NEW" ? "bg-success/10 text-success" :
                                lead.status === "CONTACTED" ? "bg-primary/10 text-primary" :
                                lead.status === "CONVERTED" ? "bg-primary/10 text-primary" :
                                lead.status === "LOST" ? "bg-error/10 text-error" :
                                "bg-bg-soft text-text-muted"
                              }`}>
                                {lead.status === "NEW" ? "Nuovo" :
                                 lead.status === "CONTACTED" ? "Contattato" :
                                 lead.status === "ONBOARDING" ? "Onboarding" :
                                 lead.status === "CONVERTED" ? "Convertito" :
                                 lead.status === "LOST" ? "Perso" : lead.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-text-muted">
                              {new Date(lead.createdAt).toLocaleDateString("it-IT")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {sellerLeads.length === 0 && (
                      <p className="text-center py-8 text-text-muted">Nessun lead venditore.</p>
                    )}
                  </div>
                </div>

                {/* Agency Leads Table */}
                <div className="bg-white rounded-xl border border-border">
                  <div className="p-5 border-b border-border">
                    <h3 className="font-medium text-primary-dark">Lead Agenzie</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Agenzia</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Contatto</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Email</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Zona</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Zone Preferite</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Stato</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Data</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agencyLeads.map((lead: any) => {
                          const prefZones = Array.isArray(lead.preferredZones) ? lead.preferredZones : [];
                          return (
                          <tr key={lead.id} className="border-b border-border hover:bg-bg-soft">
                            <td className="py-3 px-4">
                              <p className="text-sm font-medium">{lead.agencyName}</p>
                              {lead.address && <p className="text-xs text-text-muted">{lead.address}</p>}
                            </td>
                            <td className="py-3 px-4 text-sm">{lead.contactName}</td>
                            <td className="py-3 px-4 text-sm text-text-muted">{lead.email}</td>
                            <td className="py-3 px-4 text-sm">{lead.city} ({lead.province})</td>
                            <td className="py-3 px-4">
                              {prefZones.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {prefZones.map((z: any, i: number) => (
                                    <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                      {z.zoneName} <span className="text-primary/60">{z.plan?.replace(/_/g, " ")}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-text-muted">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                lead.status === "NEW" ? "bg-success/10 text-success" :
                                lead.status === "CONTACTED" ? "bg-primary/10 text-primary" :
                                lead.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                                lead.status === "CONVERTED" ? "bg-primary/10 text-primary" :
                                lead.status === "LOST" ? "bg-error/10 text-error" :
                                "bg-bg-soft text-text-muted"
                              }`}>
                                {lead.status === "NEW" ? "Nuovo" :
                                 lead.status === "CONTACTED" ? "Contattato" :
                                 lead.status === "ONBOARDING" ? "Onboarding" :
                                 lead.status === "APPROVED" ? "Approvato" :
                                 lead.status === "CONVERTED" ? "Convertito" :
                                 lead.status === "LOST" ? "Rifiutato" : lead.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-text-muted">
                              {new Date(lead.createdAt).toLocaleDateString("it-IT")}
                            </td>
                            <td className="py-3 px-4">
                              {(lead.status === "NEW" || lead.status === "CONTACTED") && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleLeadAction(lead.id, "approve")}
                                    className="text-xs px-3 py-1 bg-success/10 text-success rounded-lg hover:bg-success/20 font-medium"
                                  >
                                    Approva
                                  </button>
                                  <button
                                    onClick={() => handleLeadAction(lead.id, "reject")}
                                    className="text-xs px-3 py-1 bg-error/10 text-error rounded-lg hover:bg-error/20 font-medium"
                                  >
                                    Rifiuta
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {agencyLeads.length === 0 && (
                      <p className="text-center py-8 text-text-muted">Nessun lead agenzia.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Assignments */}
            {activeTab === "assignments" && (
              <div className="space-y-4">
                <p className="text-sm text-text-muted">
                  Immobili senza agenzia collegata. Clicca &quot;Auto-Assegna&quot; per avviare il matchmaking automatico.
                </p>
                <div className="space-y-3">
                  {properties
                    .filter((p: any) => !p.assignment)
                    .map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-border">
                        <div>
                          <p className="font-medium">{p.title}</p>
                          <p className="text-sm text-text-muted">{p.city} — {formatPrice(p.price)}</p>
                        </div>
                        <button
                          onClick={() => handleAssign(p.id)}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/85 transition-colors"
                        >
                          Auto-Assegna
                        </button>
                      </div>
                    ))}
                  {properties.filter((p: any) => !p.assignment).length === 0 && (
                    <p className="text-center py-8 text-text-muted">Tutti gli immobili sono assegnati.</p>
                  )}
                </div>
              </div>
            )}

            {/* Territories / Zones */}
            {activeTab === "territories" && (
              <div className="space-y-6">
                {/* Zone Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Zone Totali", value: zones.length, color: "text-primary" },
                    { label: "Zone Attive", value: zones.filter((z: any) => z.isActive).length, color: "text-success" },
                    { label: "Territori Assegnati", value: zones.reduce((acc: number, z: any) => acc + (z._count?.territories || 0), 0), color: "text-accent" },
                    { label: "Province Coperte", value: new Set(zones.map((z: any) => z.province)).size, color: "text-primary-dark" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border border-border">
                      <p className="text-sm text-text-muted">{stat.label}</p>
                      <p className={`text-3xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Zones Table */}
                <div className="bg-white rounded-xl border border-border">
                  <div className="p-5 border-b border-border flex items-center justify-between">
                    <h3 className="font-medium text-primary-dark">Zone Territoriali</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Zona</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Classe</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Provincia</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Score</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Popolazione</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Partner</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Prezzo Base</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-text-muted">Stato</th>
                        </tr>
                      </thead>
                      <tbody>
                        {zones.map((zone: any) => {
                          const classLabels: Record<string, string> = {
                            BASE: "Base",
                            URBANA: "Urbana",
                            PREMIUM: "Premium",
                          };
                          const classColors: Record<string, string> = {
                            BASE: "bg-indigo-50 text-indigo-700",
                            URBANA: "bg-cyan-50 text-cyan-700",
                            PREMIUM: "bg-rose-50 text-rose-700",
                          };
                          const activePartners = zone._count?.territories || 0;
                          const lowestPrice = zone.monthlyPrice;
                          return (
                            <tr key={zone.id} className="border-b border-border hover:bg-bg-soft">
                              <td className="py-3 px-4">
                                <p className="text-sm font-medium">{zone.name}</p>
                                {zone.city && <p className="text-xs text-text-muted">{zone.city}</p>}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${classColors[zone.zoneClass] || "bg-bg-soft text-text-muted"}`}>
                                  {classLabels[zone.zoneClass] || zone.zoneClass}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm">{zone.province}</td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-medium">{zone.marketScore}/10</span>
                              </td>
                              <td className="py-3 px-4 text-sm">{zone.population?.toLocaleString("it-IT") || "—"}</td>
                              <td className="py-3 px-4 text-sm font-medium">{activePartners}</td>
                              <td className="py-3 px-4 text-sm">
                                {lowestPrice ? `\u20AC${(lowestPrice / 100).toLocaleString("it-IT")}` : "—"}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${zone.isActive ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                                  {zone.isActive ? "Attiva" : "Inattiva"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {zones.length === 0 && (
                      <p className="text-center py-8 text-text-muted">Nessuna zona creata. Esegui lo script di import ISTAT.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <PropertyEditModal
        isOpen={!!editingProperty}
        onClose={() => setEditingProperty(null)}
        property={editingProperty}
        onSaved={loadData}
      />
      <AgencyEditModal
        isOpen={!!editingAgency}
        onClose={() => setEditingAgency(null)}
        agency={editingAgency}
        onSaved={loadData}
      />
      <UserEditModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSaved={loadData}
      />
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        itemName={deletingItem?.name || ""}
        loading={deleteLoading}
      />
    </DashboardLayout>
  );
}
