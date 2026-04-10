"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  templateName: string | null;
  category: string;
  status: string;
  attempts: number;
  lastError: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  bouncedAt: string | null;
  complainedAt: string | null;
  createdAt: string;
}

interface EmailResponse {
  emails: EmailLog[];
  total: number;
  page: number;
  totalPages: number;
}

const STATUS_COLORS: Record<string, string> = {
  QUEUED: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  BOUNCED: "bg-red-100 text-red-700",
  COMPLAINED: "bg-orange-100 text-orange-700",
  FAILED: "bg-red-100 text-red-700",
};

export default function AdminEmailPage() {
  const [data, setData] = useState<EmailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterTo, setFilterTo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTemplate, setFilterTemplate] = useState("");

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (filterTo) params.set("to", filterTo);
    if (filterStatus) params.set("status", filterStatus);
    if (filterTemplate) params.set("templateName", filterTemplate);

    try {
      const res = await fetch(`/api/admin/emails?${params.toString()}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error("Error fetching emails:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filterTo, filterStatus, filterTemplate]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("it-IT", {
      timeZone: "Europe/Rome",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Email Log</h1>
          {data && (
            <p className="text-sm text-slate-500">
              {data.total} email totali
            </p>
          )}
        </div>

        {/* Filtri */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Cerca per email..."
            value={filterTo}
            onChange={(e) => {
              setFilterTo(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tutti gli stati</option>
            <option value="QUEUED">In coda</option>
            <option value="SENT">Inviata</option>
            <option value="DELIVERED">Consegnata</option>
            <option value="BOUNCED">Rimbalzata</option>
            <option value="COMPLAINED">Segnalata</option>
            <option value="FAILED">Fallita</option>
          </select>
          <input
            type="text"
            placeholder="Template name..."
            value={filterTemplate}
            onChange={(e) => {
              setFilterTemplate(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tabella */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Destinatario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Oggetto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Template
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Stato
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Consegnata
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">
                  Aperta
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Caricamento...
                  </td>
                </tr>
              ) : data?.emails.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Nessuna email trovata
                  </td>
                </tr>
              ) : (
                data?.emails.map((email) => (
                  <tr key={email.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {formatDate(email.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {email.to}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-sm text-slate-600">
                      {email.subject}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {email.templateName ? (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {email.templateName}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[email.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {email.status}
                      </span>
                      {email.lastError && (
                        <p className="mt-1 max-w-xs truncate text-xs text-red-500" title={email.lastError}>
                          {email.lastError}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {formatDate(email.deliveredAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {formatDate(email.openedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginazione */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Pagina {data.page} di {data.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Precedente
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Successiva
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
