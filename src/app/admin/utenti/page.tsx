"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status?: string;
  suspendedReason?: string | null;
  createdAt: string;
}

export default function AdminUtentiPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    qs.set("limit", "100");
    const res = await fetch(`/api/admin/users?${qs.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function suspend(id: string) {
    const reason = prompt("Motivo della sospensione?");
    if (reason === null) return;
    const res = await fetch(`/api/admin/users/${id}/suspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) load();
    else alert("Errore");
  }

  async function unsuspend(id: string) {
    if (!confirm("Riattivare l'account?")) return;
    const res = await fetch(`/api/admin/users/${id}/unsuspend`, { method: "POST" });
    if (res.ok) load();
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#0B1D3A]">Utenti</h1>
          <a
            href="/api/admin/export/users"
            className="rounded-lg bg-[#C9A84C] px-4 py-2 text-sm font-medium text-white"
          >
            Esporta CSV
          </a>
        </div>

        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Cerca per nome o email…"
            className="flex-1 rounded-lg border border-black/10 px-4 py-2"
          />
          <button onClick={load} className="rounded-lg bg-[#0B1D3A] px-4 py-2 text-sm text-white">
            Cerca
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-[#0B1D3A]/50">Caricamento…</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-bg-soft text-left text-xs uppercase text-[#0B1D3A]/60">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Ruolo</th>
                  <th className="px-4 py-3">Stato</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-black/[0.04]">
                    <td className="px-4 py-3">{u.name || "—"}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3">
                      {u.status === "SUSPENDED" || u.status === "BANNED" ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                          {u.status}
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                          ATTIVO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.status === "SUSPENDED" || u.status === "BANNED" ? (
                        <button
                          onClick={() => unsuspend(u.id)}
                          className="text-xs font-medium text-emerald-700 hover:underline"
                        >
                          Riattiva
                        </button>
                      ) : (
                        <button
                          onClick={() => suspend(u.id)}
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          Sospendi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
