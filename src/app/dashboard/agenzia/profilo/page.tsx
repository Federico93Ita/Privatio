"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface AgencyProfile {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  videoUrl: string | null;
  foundedYear: number | null;
  teamSize: number | null;
  responseTimeHours: number | null;
  transactionsCount: number | null;
  specializations: string[];
  languages: string[];
  serviceAreas: string[];
  gallery: string[];
  certifications: string[];
  awards: string[];
  uniqueSellingPoints: string[];
  website: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  whatsappNumber: string | null;
  profileCompletedAt: string | null;
}

const REQUIRED_FIELDS = [
  { key: "tagline", label: "Tagline (min 10 caratteri)" },
  { key: "description", label: "Descrizione chi siamo (min 80 caratteri)" },
  { key: "uniqueSellingPoints", label: "Almeno 3 punti di forza" },
  { key: "specializations", label: "Almeno una specializzazione" },
];

function checkComplete(p: AgencyProfile): { complete: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!p.tagline || p.tagline.trim().length < 10) missing.push(REQUIRED_FIELDS[0].label);
  if (!p.description || p.description.trim().length < 80) missing.push(REQUIRED_FIELDS[1].label);
  if (!p.uniqueSellingPoints || p.uniqueSellingPoints.length < 3) missing.push(REQUIRED_FIELDS[2].label);
  if (!p.specializations || p.specializations.length < 1) missing.push(REQUIRED_FIELDS[3].label);
  return { complete: missing.length === 0, missing };
}

export default function AgencyProfileEditorPage() {
  const [profile, setProfile] = useState<AgencyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/agency/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.agency) setProfile(d.agency);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function update<K extends keyof AgencyProfile>(key: K, value: AgencyProfile[K]) {
    if (!profile) return;
    setProfile({ ...profile, [key]: value });
  }

  function updateArray(key: keyof AgencyProfile, raw: string) {
    const arr = raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    update(key, arr as never);
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        tagline: profile.tagline,
        description: profile.description,
        logoUrl: profile.logoUrl,
        coverImageUrl: profile.coverImageUrl,
        videoUrl: profile.videoUrl,
        foundedYear: profile.foundedYear,
        teamSize: profile.teamSize,
        responseTimeHours: profile.responseTimeHours,
        transactionsCount: profile.transactionsCount,
        specializations: profile.specializations,
        languages: profile.languages,
        serviceAreas: profile.serviceAreas,
        gallery: profile.gallery,
        certifications: profile.certifications,
        awards: profile.awards,
        uniqueSellingPoints: profile.uniqueSellingPoints,
        website: profile.website,
        instagramUrl: profile.instagramUrl,
        facebookUrl: profile.facebookUrl,
        linkedinUrl: profile.linkedinUrl,
        whatsappNumber: profile.whatsappNumber,
      };
      const res = await fetch("/api/agency/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.agency);
        setMessage({ type: "success", text: "Profilo salvato con successo" });
      } else {
        setMessage({ type: "error", text: data.error || "Errore nel salvataggio" });
      }
    } catch {
      setMessage({ type: "error", text: "Errore di rete" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="agency">
        <p className="text-text-muted">Caricamento…</p>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout role="agency">
        <p className="text-text-muted">Profilo non disponibile.</p>
      </DashboardLayout>
    );
  }

  const { complete, missing } = checkComplete(profile);

  return (
    <DashboardLayout role="agency">
      <div className="max-w-3xl space-y-6">
        {/* Completeness banner */}
        <div
          className={`rounded-xl border p-4 ${
            complete
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <p className="font-semibold">
            {complete
              ? "✓ Profilo completo — visibile ai venditori"
              : "Profilo incompleto — non riceverai assegnazioni finché non lo completi"}
          </p>
          {!complete && (
            <ul className="mt-2 list-disc pl-5 text-sm">
              {missing.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          )}
        </div>

        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <Field label="Tagline (max 160)">
          <input
            type="text"
            maxLength={160}
            value={profile.tagline || ""}
            onChange={(e) => update("tagline", e.target.value)}
            className="input"
            placeholder="Es. Il tuo partner immobiliare a Torino dal 1995"
          />
        </Field>

        <Field label="Descrizione chi siamo (max 2000)">
          <textarea
            maxLength={2000}
            rows={6}
            value={profile.description || ""}
            onChange={(e) => update("description", e.target.value)}
            className="input"
          />
          <p className="text-xs text-text-muted mt-1">
            {(profile.description || "").length}/2000
          </p>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Logo URL">
            <input
              type="url"
              value={profile.logoUrl || ""}
              onChange={(e) => update("logoUrl", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Cover image URL">
            <input
              type="url"
              value={profile.coverImageUrl || ""}
              onChange={(e) => update("coverImageUrl", e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Punti di forza (uno per riga, min 3)">
          <textarea
            rows={5}
            value={(profile.uniqueSellingPoints || []).join("\n")}
            onChange={(e) => updateArray("uniqueSellingPoints", e.target.value)}
            className="input"
            placeholder={"Esperienza pluriennale\nValutazioni gratuite\nFotografia professionale inclusa"}
          />
        </Field>

        <Field label="Specializzazioni (una per riga)">
          <textarea
            rows={4}
            value={(profile.specializations || []).join("\n")}
            onChange={(e) => updateArray("specializations", e.target.value)}
            className="input"
            placeholder={"Ville di lusso\nImmobili commerciali\nAste"}
          />
        </Field>

        <Field label="Lingue parlate (una per riga)">
          <textarea
            rows={3}
            value={(profile.languages || []).join("\n")}
            onChange={(e) => updateArray("languages", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Zone di competenza (una per riga)">
          <textarea
            rows={3}
            value={(profile.serviceAreas || []).join("\n")}
            onChange={(e) => updateArray("serviceAreas", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Galleria foto (URL, una per riga)">
          <textarea
            rows={4}
            value={(profile.gallery || []).join("\n")}
            onChange={(e) => updateArray("gallery", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Video presentazione (URL embed YouTube/Vimeo)">
          <input
            type="url"
            value={profile.videoUrl || ""}
            onChange={(e) => update("videoUrl", e.target.value)}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Anno fondazione">
            <input
              type="number"
              value={profile.foundedYear || ""}
              onChange={(e) => update("foundedYear", e.target.value ? Number(e.target.value) : null)}
              className="input"
            />
          </Field>
          <Field label="Dimensione team">
            <input
              type="number"
              value={profile.teamSize || ""}
              onChange={(e) => update("teamSize", e.target.value ? Number(e.target.value) : null)}
              className="input"
            />
          </Field>
          <Field label="Risposta entro (h)">
            <input
              type="number"
              value={profile.responseTimeHours || ""}
              onChange={(e) =>
                update("responseTimeHours", e.target.value ? Number(e.target.value) : null)
              }
              className="input"
            />
          </Field>
          <Field label="Transazioni totali">
            <input
              type="number"
              value={profile.transactionsCount || ""}
              onChange={(e) =>
                update("transactionsCount", e.target.value ? Number(e.target.value) : null)
              }
              className="input"
            />
          </Field>
        </div>

        <Field label="Certificazioni (una per riga)">
          <textarea
            rows={3}
            value={(profile.certifications || []).join("\n")}
            onChange={(e) => updateArray("certifications", e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Premi (uno per riga)">
          <textarea
            rows={3}
            value={(profile.awards || []).join("\n")}
            onChange={(e) => updateArray("awards", e.target.value)}
            className="input"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Sito web">
            <input
              type="url"
              value={profile.website || ""}
              onChange={(e) => update("website", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Instagram">
            <input
              type="url"
              value={profile.instagramUrl || ""}
              onChange={(e) => update("instagramUrl", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Facebook">
            <input
              type="url"
              value={profile.facebookUrl || ""}
              onChange={(e) => update("facebookUrl", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="LinkedIn">
            <input
              type="url"
              value={profile.linkedinUrl || ""}
              onChange={(e) => update("linkedinUrl", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="WhatsApp">
            <input
              type="tel"
              value={profile.whatsappNumber || ""}
              onChange={(e) => update("whatsappNumber", e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <div className="sticky bottom-0 bg-white py-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? "Salvataggio…" : "Salva profilo"}
          </button>
        </div>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 0.5rem;
          background: white;
          font-size: 0.9rem;
          color: #0b1d3a;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #c9a84c;
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
        }
      `}</style>
    </DashboardLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-text mb-1.5">{label}</span>
      {children}
    </label>
  );
}
