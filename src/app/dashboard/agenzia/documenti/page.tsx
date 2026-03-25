"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Document {
  id: string;
  type: "contract" | "lead" | "invoice";
  title: string;
  description: string;
  date: string;
  status: string;
}

export default function AgencyDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "contract" | "lead" | "invoice">("all");

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      setLoading(true);
      // Fetch contracts and assignments to build document list
      const res = await fetch("/api/dashboard/agency");
      if (!res.ok) throw new Error();
      const data = await res.json();

      const docs: Document[] = [];

      // Add contract acceptance as a document
      if (data.agency?.contractAcceptedAt) {
        docs.push({
          id: "contract-acceptance",
          type: "contract",
          title: "Contratto di Convenzionamento",
          description: "Contratto firmato con Privatio per l'accesso ai lead venditori",
          date: data.agency.contractAcceptedAt,
          status: "Firmato",
        });
      }

      // Add each property assignment as a lead document
      if (data.agency?.assignments) {
        for (const assignment of data.agency.assignments) {
          docs.push({
            id: `lead-${assignment.id}`,
            type: "lead",
            title: `Lead: ${assignment.property?.title || "Immobile"}`,
            description: `${assignment.property?.city || ""} — ${assignment.property?.address || ""}`,
            date: assignment.createdAt,
            status: assignment.status === "ACTIVE" ? "Attivo" : assignment.status === "COMPLETED" ? "Completato" : assignment.status,
          });
        }
      }

      // Sort by date desc
      docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setDocuments(docs);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === "all" ? documents : documents.filter((d) => d.type === filter);

  const typeIcons: Record<string, string> = {
    contract: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    lead: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    invoice: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
  };

  const statusColors: Record<string, string> = {
    Firmato: "bg-success/10 text-success",
    Attivo: "bg-primary/10 text-primary",
    Completato: "bg-text-muted/10 text-text-muted",
  };

  return (
    <DashboardLayout role="agency">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-light tracking-[-0.03em] text-text">Documenti e Contratti</h1>
          <p className="text-sm text-text-muted mt-1">
            Tutti i documenti relativi alla tua attività sulla piattaforma.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(["all", "contract", "lead", "invoice"] as const).map((f) => {
            const labels = { all: "Tutti", contract: "Contratti", lead: "Lead", invoice: "Fatture" };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  filter === f
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-text-muted border-border hover:bg-bg-soft"
                }`}
              >
                {labels[f]}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl p-6 border border-border">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-border/50 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-border/50 rounded" />
                    <div className="h-3 w-32 bg-border/50 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl p-8 border border-border text-center">
            <svg className="w-16 h-16 text-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-primary-dark mb-2">Nessun documento</h3>
            <p className="text-text-muted text-sm">
              {filter === "all"
                ? "I documenti relativi ai tuoi contratti e lead appariranno qui."
                : `Nessun documento di tipo "${filter}" trovato.`}
            </p>
          </div>
        )}

        {/* Document list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl p-5 border border-border flex items-start gap-4 hover:shadow-sm transition-shadow"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={typeIcons[doc.type] || typeIcons.contract} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-text text-sm">{doc.title}</h3>
                      <p className="text-text-muted text-xs mt-0.5">{doc.description}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusColors[doc.status] || "bg-bg-soft text-text-muted"}`}>
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-text-muted text-xs mt-2">
                    {new Date(doc.date).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
