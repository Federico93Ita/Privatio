"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Log {
  id: string;
  action: string;
  userId: string | null;
  targetId: string | null;
  details: unknown;
  createdAt: string;
  actor: { id: string; name: string | null; email: string } | null;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const qs = action ? `?action=${encodeURIComponent(action)}` : "";
    const res = await fetch(`/api/admin/audit${qs}`);
    if (res.ok) setLogs((await res.json()).logs || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-semibold text-[#0B1D3A]">Audit log</h1>
        <div className="flex gap-2">
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Filtra per action (es. user.suspend)"
            className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <button onClick={load} className="rounded-lg bg-[#0B1D3A] px-4 py-2 text-sm text-white">
            Filtra
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-[#0B1D3A]/50">Caricamento…</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-bg-soft text-left text-xs uppercase text-[#0B1D3A]/60">
                <tr>
                  <th className="px-4 py-3">Quando</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Attore</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Dettagli</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-black/[0.04] align-top">
                    <td className="px-4 py-3 text-xs text-[#0B1D3A]/60 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString("it-IT")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{l.action}</td>
                    <td className="px-4 py-3 text-xs">
                      {l.actor ? l.actor.name || l.actor.email : l.userId || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">{l.targetId || "—"}</td>
                    <td className="px-4 py-3 text-xs text-[#0B1D3A]/60">
                      {l.details ? JSON.stringify(l.details) : ""}
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
