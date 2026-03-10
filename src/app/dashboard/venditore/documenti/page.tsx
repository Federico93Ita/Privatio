"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatDate } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  category: string;
  uploader: { name: string };
  createdAt: string;
}

const CATEGORIES = [
  { id: "ATTO_PROVENIENZA", label: "Atto di provenienza" },
  { id: "VISURA_CATASTALE", label: "Visura catastale" },
  { id: "PLANIMETRIA", label: "Planimetria" },
  { id: "APE", label: "APE (Attestato Energetico)" },
  { id: "CONFORMITA_IMPIANTI", label: "Conformità impianti" },
  { id: "CONTRATTO", label: "Contratto" },
  { id: "ALTRO", label: "Altro" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SellerDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALTRO");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/dashboard/seller")
      .then((r) => r.json())
      .then((data) => {
        if (data.property?.id) {
          setPropertyId(data.property.id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!propertyId) return;
    fetch(`/api/documents?propertyId=${propertyId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.documents) setDocuments(data.documents);
      })
      .catch(console.error);
  }, [propertyId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !propertyId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("propertyId", propertyId);
    formData.append("category", selectedCategory);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments((prev) => [data.document, ...prev]);
      }
    } catch {
      // silent
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(docId: string) {
    try {
      const res = await fetch(`/api/documents?id=${docId}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
      }
    } catch {
      // silent
    }
  }

  const getCategoryLabel = (cat: string) =>
    CATEGORIES.find((c) => c.id === cat)?.label || cat;

  return (
    <DashboardLayout role="seller">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0a1f44]">Documenti</h1>

        {loading ? (
          <div className="h-48 bg-[#f8fafc] rounded-lg animate-pulse" />
        ) : !propertyId ? (
          <div className="bg-white rounded-xl p-8 border border-[#e2e8f0] text-center">
            <p className="text-[#64748b]">Inserisci un immobile per gestire i documenti.</p>
          </div>
        ) : (
          <>
            {/* Upload area */}
            <div className="bg-white rounded-xl p-5 border border-[#e2e8f0]">
              <h3 className="font-semibold text-[#0a1f44] mb-3">Carica documento</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0e8ff1]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-[#0e8ff1] text-white rounded-lg text-sm font-medium hover:bg-[#0a1f44] transition-colors disabled:opacity-50"
                >
                  {uploading ? "Caricamento..." : "Seleziona file"}
                </button>
              </div>
              <p className="text-xs text-[#94a3b8] mt-2">PDF, JPEG, PNG o WebP. Max 20MB.</p>
            </div>

            {/* Document list */}
            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-xl p-4 border border-[#e2e8f0] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-[#f0f9ff] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-[#0e8ff1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#0a1f44] truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 text-xs text-[#64748b]">
                          <span className="px-1.5 py-0.5 bg-[#f8fafc] rounded">{getCategoryLabel(doc.category)}</span>
                          <span>{formatFileSize(doc.size)}</span>
                          <span>{formatDate(doc.createdAt)}</span>
                          <span>da {doc.uploader?.name || "—"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-[#0e8ff1] hover:bg-[#f0f9ff] rounded-lg transition-colors"
                        title="Scarica"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors"
                        title="Elimina"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 border border-[#e2e8f0] text-center">
                <svg className="w-16 h-16 text-[#e2e8f0] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-[#0a1f44] mb-2">Nessun documento</h3>
                <p className="text-[#64748b]">Carica i documenti necessari per la vendita.</p>
              </div>
            )}

            {/* Checklist */}
            <div className="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0]">
              <h3 className="font-semibold text-[#0a1f44] mb-2">Documenti utili per la vendita</h3>
              <ul className="space-y-2 text-sm text-[#64748b]">
                {[
                  "Atto di provenienza (rogito, donazione, successione)",
                  "Visura catastale aggiornata",
                  "Planimetria catastale",
                  "APE (Attestato di Prestazione Energetica)",
                  "Certificato di conformità impianti",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#0e8ff1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
