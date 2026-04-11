"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ImageUploader, { GalleryUploader } from "@/components/ui/ImageUploader";
import Image from "next/image";

interface AgencyProfile {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  province: string | null;
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
  rating: number | null;
  reviewCount: number | null;
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

type Tab = "edit" | "preview";

export default function AgencyProfileEditorPage() {
  const [profile, setProfile] = useState<AgencyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("edit");

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
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-40 bg-gray-200 rounded-xl" />
          <div className="h-40 bg-gray-200 rounded-xl" />
        </div>
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
      <div className="max-w-5xl space-y-6">
        {/* Header + Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading text-primary-dark">Profilo Agenzia</h1>
            <p className="text-sm text-text-muted mt-1">
              Come appari ai venditori su Privatio
            </p>
          </div>
          <div className="flex bg-[#0B1D3A]/5 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "edit"
                  ? "bg-white text-[#0B1D3A] shadow-sm"
                  : "text-[#0B1D3A]/50 hover:text-[#0B1D3A]/70"
              }`}
            >
              Modifica
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "preview"
                  ? "bg-white text-[#0B1D3A] shadow-sm"
                  : "text-[#0B1D3A]/50 hover:text-[#0B1D3A]/70"
              }`}
            >
              Anteprima venditori
            </button>
          </div>
        </div>

        {/* Completeness banner */}
        <div
          className={`rounded-xl border p-4 ${
            complete
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <p className="font-semibold text-sm">
            {complete
              ? "Profilo completo — visibile ai venditori"
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

        {activeTab === "edit" ? (
          <EditTab
            profile={profile}
            update={update}
            updateArray={updateArray}
            handleSave={handleSave}
            saving={saving}
          />
        ) : (
          <PreviewTab profile={profile} />
        )}
      </div>
    </DashboardLayout>
  );
}

/* ====================================================================== */
/*  EDIT TAB                                                               */
/* ====================================================================== */

function EditTab({
  profile,
  update,
  updateArray,
  handleSave,
  saving,
}: {
  profile: AgencyProfile;
  update: <K extends keyof AgencyProfile>(key: K, value: AgencyProfile[K]) => void;
  updateArray: (key: keyof AgencyProfile, raw: string) => void;
  handleSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-8">
      {/* ── Immagini principali ── */}
      <Section title="Immagini" description="Logo e copertina della tua agenzia">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-2">
              Logo agenzia
            </label>
            <ImageUploader
              value={profile.logoUrl}
              onChange={(url) => update("logoUrl", url)}
              folder="logo"
              aspect="aspect-square"
              placeholder="Carica il logo della tua agenzia"
              className="max-w-[200px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-2">
              Immagine di copertina
            </label>
            <ImageUploader
              value={profile.coverImageUrl}
              onChange={(url) => update("coverImageUrl", url)}
              folder="cover"
              aspect="aspect-video"
              placeholder="Carica la foto di copertina (rapporto 16:9)"
            />
          </div>
        </div>
      </Section>

      {/* ── Info principali ── */}
      <Section title="Informazioni principali" description="Tagline e descrizione visibili ai venditori">
        <Field label="Tagline (max 160 caratteri)">
          <input
            type="text"
            maxLength={160}
            value={profile.tagline || ""}
            onChange={(e) => update("tagline", e.target.value)}
            className="input"
            placeholder="Es. Il tuo partner immobiliare a Torino dal 1995"
          />
          <CharCount current={(profile.tagline || "").length} max={160} />
        </Field>

        <Field label="Chi siamo (max 2000 caratteri)">
          <textarea
            maxLength={2000}
            rows={6}
            value={profile.description || ""}
            onChange={(e) => update("description", e.target.value)}
            className="input"
            placeholder="Racconta la storia della tua agenzia, i valori, l'esperienza..."
          />
          <CharCount current={(profile.description || "").length} max={2000} min={80} />
        </Field>
      </Section>

      {/* ── Punti di forza e specializzazioni ── */}
      <Section title="Punti di forza" description="Cosa vi rende unici — il venditore lo vedrà nella scheda agenzia">
        <Field label="Punti di forza (uno per riga, minimo 3)">
          <textarea
            rows={5}
            value={(profile.uniqueSellingPoints || []).join("\n")}
            onChange={(e) => updateArray("uniqueSellingPoints", e.target.value)}
            className="input"
            placeholder={"Esperienza pluriennale nel mercato locale\nValutazioni gratuite e accurate\nFotografia professionale inclusa"}
          />
        </Field>

        <Field label="Specializzazioni (una per riga, minimo 1)">
          <textarea
            rows={4}
            value={(profile.specializations || []).join("\n")}
            onChange={(e) => updateArray("specializations", e.target.value)}
            className="input"
            placeholder={"Ville di lusso\nImmobili commerciali\nAste giudiziarie"}
          />
        </Field>
      </Section>

      {/* ── Galleria ── */}
      <Section title="Galleria fotografica" description="Foto dell'agenzia, team, ufficio — massimo 20">
        <GalleryUploader
          value={profile.gallery || []}
          onChange={(urls) => update("gallery", urls as never)}
          folder="gallery"
          max={20}
        />
      </Section>

      {/* ── Numeri ── */}
      <Section title="Numeri" description="Dati che danno credibilità alla tua agenzia">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Anno fondazione">
            <input
              type="number"
              value={profile.foundedYear || ""}
              onChange={(e) => update("foundedYear", e.target.value ? Number(e.target.value) : null)}
              className="input"
              placeholder="2005"
            />
          </Field>
          <Field label="Team (persone)">
            <input
              type="number"
              value={profile.teamSize || ""}
              onChange={(e) => update("teamSize", e.target.value ? Number(e.target.value) : null)}
              className="input"
              placeholder="12"
            />
          </Field>
          <Field label="Risposta entro (h)">
            <input
              type="number"
              value={profile.responseTimeHours || ""}
              onChange={(e) => update("responseTimeHours", e.target.value ? Number(e.target.value) : null)}
              className="input"
              placeholder="2"
            />
          </Field>
          <Field label="Transazioni totali">
            <input
              type="number"
              value={profile.transactionsCount || ""}
              onChange={(e) => update("transactionsCount", e.target.value ? Number(e.target.value) : null)}
              className="input"
              placeholder="450"
            />
          </Field>
        </div>
      </Section>

      {/* ── Video ── */}
      <Section title="Video" description="Video di presentazione della tua agenzia">
        <Field label="URL video (YouTube o Vimeo)">
          <input
            type="url"
            value={profile.videoUrl || ""}
            onChange={(e) => update("videoUrl", e.target.value)}
            className="input"
            placeholder="https://youtube.com/watch?v=..."
          />
        </Field>
      </Section>

      {/* ── Extra info ── */}
      <Section title="Dettagli aggiuntivi">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Lingue parlate (una per riga)">
            <textarea
              rows={3}
              value={(profile.languages || []).join("\n")}
              onChange={(e) => updateArray("languages", e.target.value)}
              className="input"
              placeholder={"Italiano\nInglese\nFrancese"}
            />
          </Field>
          <Field label="Zone di competenza (una per riga)">
            <textarea
              rows={3}
              value={(profile.serviceAreas || []).join("\n")}
              onChange={(e) => updateArray("serviceAreas", e.target.value)}
              className="input"
              placeholder={"Torino Centro\nCollina torinese\nPrecollina"}
            />
          </Field>
        </div>

        <Field label="Certificazioni (una per riga)">
          <textarea
            rows={3}
            value={(profile.certifications || []).join("\n")}
            onChange={(e) => updateArray("certifications", e.target.value)}
            className="input"
            placeholder={"FIAIP\nREA certificata"}
          />
        </Field>

        <Field label="Premi e riconoscimenti (uno per riga)">
          <textarea
            rows={3}
            value={(profile.awards || []).join("\n")}
            onChange={(e) => updateArray("awards", e.target.value)}
            className="input"
            placeholder={"Miglior agenzia Torino 2024\nTop Performer Privatio Q1 2025"}
          />
        </Field>
      </Section>

      {/* ── Social / Contatti ── */}
      <Section title="Contatti e social" description="Link visibili nella tua scheda pubblica">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Sito web">
            <input
              type="url"
              value={profile.website || ""}
              onChange={(e) => update("website", e.target.value)}
              className="input"
              placeholder="https://www.tuaagenzia.it"
            />
          </Field>
          <Field label="Instagram">
            <input
              type="url"
              value={profile.instagramUrl || ""}
              onChange={(e) => update("instagramUrl", e.target.value)}
              className="input"
              placeholder="https://instagram.com/tuaagenzia"
            />
          </Field>
          <Field label="Facebook">
            <input
              type="url"
              value={profile.facebookUrl || ""}
              onChange={(e) => update("facebookUrl", e.target.value)}
              className="input"
              placeholder="https://facebook.com/tuaagenzia"
            />
          </Field>
          <Field label="LinkedIn">
            <input
              type="url"
              value={profile.linkedinUrl || ""}
              onChange={(e) => update("linkedinUrl", e.target.value)}
              className="input"
              placeholder="https://linkedin.com/company/tuaagenzia"
            />
          </Field>
          <Field label="WhatsApp">
            <input
              type="tel"
              value={profile.whatsappNumber || ""}
              onChange={(e) => update("whatsappNumber", e.target.value)}
              className="input"
              placeholder="+39 333 1234567"
            />
          </Field>
        </div>
      </Section>

      {/* ── Save button ── */}
      <div className="sticky bottom-0 bg-white py-4 border-t border-border flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-[#C9A84C] text-white font-semibold hover:bg-[#D4B65E] disabled:opacity-60 transition-colors"
        >
          {saving ? "Salvataggio..." : "Salva profilo"}
        </button>
        <span className="text-xs text-[#0B1D3A]/30">
          Le modifiche saranno visibili ai venditori dopo il salvataggio
        </span>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e7eb;
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
    </div>
  );
}

/* ====================================================================== */
/*  PREVIEW TAB — Esattamente come la vedono i venditori                   */
/* ====================================================================== */

const classColors: Record<string, string> = {
  BASE: "bg-blue-100 text-blue-700",
  URBANA: "bg-purple-100 text-purple-700",
  PREMIUM: "bg-amber-100 text-amber-700",
};

function PreviewTab({ profile }: { profile: AgencyProfile }) {
  const stats = [
    profile.foundedYear && { label: "Anno fondazione", value: profile.foundedYear.toString() },
    profile.teamSize && { label: "Team", value: `${profile.teamSize} persone` },
    profile.responseTimeHours && {
      label: "Tempo risposta",
      value: profile.responseTimeHours <= 1 ? "< 1 ora" : `${profile.responseTimeHours} ore`,
    },
    profile.transactionsCount && { label: "Transazioni", value: profile.transactionsCount.toString() },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-blue-800">Anteprima profilo pubblico</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Questo è esattamente come i venditori vedono la tua agenzia quando devono scegliere a chi affidare il loro immobile.
          </p>
        </div>
      </div>

      {/* ── Preview card (replica della pagina pubblica) ── */}
      <div className="rounded-2xl border border-[#0B1D3A]/10 overflow-hidden bg-[#F8F6F1]">
        {/* Cover */}
        <div className="relative h-40 sm:h-52 bg-gradient-to-br from-[#0B1D3A] to-[#1a2d4a]">
          {profile.coverImageUrl && (
            <Image
              src={profile.coverImageUrl}
              alt=""
              fill
              className="object-cover opacity-40"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D3A]/80 to-transparent" />
        </div>

        <div className="px-4 sm:px-6 -mt-12 relative z-10 pb-8">
          {/* Header card */}
          <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 shadow-lg p-5 sm:p-6">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#C9A84C]/20 to-[#C9A84C]/5 border border-[#C9A84C]/10 flex items-center justify-center shrink-0 overflow-hidden">
                {profile.logoUrl ? (
                  <Image src={profile.logoUrl} alt={profile.name} fill className="object-cover rounded-2xl" sizes="80px" />
                ) : (
                  <span className="text-2xl font-bold text-[#C9A84C]">{profile.name.charAt(0)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-heading text-[#0B1D3A]">{profile.name}</h2>
                {(profile.city || profile.province) && (
                  <p className="text-[#0B1D3A]/50 text-sm mt-0.5">
                    {[profile.city, profile.province].filter(Boolean).join(", ")}
                  </p>
                )}
                {profile.tagline && (
                  <p className="text-[#0B1D3A]/70 mt-2 text-sm">{profile.tagline}</p>
                )}
                {/* Rating */}
                {profile.rating && profile.rating > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3.5 h-3.5 ${i < Math.round(profile.rating!) ? "text-[#C9A84C]" : "text-gray-200"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-[#0B1D3A]/40">
                      {profile.rating.toFixed(1)} ({profile.reviewCount || 0} recensioni)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            {stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#0B1D3A]/5">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-base font-semibold text-[#0B1D3A]">{s.value}</div>
                    <div className="text-[10px] text-[#0B1D3A]/40 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="md:col-span-2 space-y-4">
              {/* Description */}
              {profile.description && (
                <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 p-5">
                  <h3 className="font-heading text-base text-[#0B1D3A] mb-2">Chi siamo</h3>
                  <p className="text-[#0B1D3A]/70 text-sm leading-relaxed whitespace-pre-line">
                    {profile.description}
                  </p>
                </div>
              )}

              {/* USP */}
              {profile.uniqueSellingPoints.length > 0 && (
                <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 p-5">
                  <h3 className="font-heading text-base text-[#0B1D3A] mb-2">Perché sceglierci</h3>
                  <ul className="space-y-1.5">
                    {profile.uniqueSellingPoints.map((usp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#0B1D3A]/70">
                        <svg className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {usp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gallery */}
              {profile.gallery.length > 0 && (
                <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 p-5">
                  <h3 className="font-heading text-base text-[#0B1D3A] mb-2">Gallery</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {profile.gallery.slice(0, 6).map((url, i) => (
                      <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                        <Image
                          src={url}
                          alt={`Foto ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {profile.specializations.length > 0 && (
                <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 p-5">
                  <h3 className="font-heading text-base text-[#0B1D3A] mb-2">Specializzazioni</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.specializations.map((s, i) => (
                      <span key={i} className="text-xs bg-[#0B1D3A]/5 text-[#0B1D3A]/70 px-2.5 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(profile.certifications.length > 0 || profile.awards.length > 0) && (
                <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 p-5">
                  {profile.certifications.length > 0 && (
                    <>
                      <h3 className="font-heading text-base text-[#0B1D3A] mb-2">Certificazioni</h3>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {profile.certifications.map((c, i) => (
                          <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">{c}</span>
                        ))}
                      </div>
                    </>
                  )}
                  {profile.awards.length > 0 && (
                    <>
                      <h3 className="font-heading text-base text-[#0B1D3A] mb-2">Riconoscimenti</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.awards.map((a, i) => (
                          <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">{a}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {profile.languages.length > 0 && (
                <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 p-5">
                  <h3 className="font-heading text-base text-[#0B1D3A] mb-2">Lingue</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.languages.map((l, i) => (
                      <span key={i} className="text-xs bg-[#0B1D3A]/5 text-[#0B1D3A]/70 px-2.5 py-1 rounded-full">{l}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contacts */}
              {(profile.website || profile.instagramUrl || profile.facebookUrl || profile.linkedinUrl || profile.whatsappNumber) && (
                <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 p-5">
                  <h3 className="font-heading text-base text-[#0B1D3A] mb-2">Contatti</h3>
                  <div className="space-y-2">
                    {profile.website && (
                      <p className="text-sm text-[#C9A84C]">Sito web</p>
                    )}
                    {profile.instagramUrl && (
                      <p className="text-sm text-[#0B1D3A]/60">Instagram</p>
                    )}
                    {profile.facebookUrl && (
                      <p className="text-sm text-[#0B1D3A]/60">Facebook</p>
                    )}
                    {profile.linkedinUrl && (
                      <p className="text-sm text-[#0B1D3A]/60">LinkedIn</p>
                    )}
                    {profile.whatsappNumber && (
                      <p className="text-sm text-[#0B1D3A]/60">WhatsApp</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Empty state hints */}
          {!profile.description && !profile.tagline && profile.uniqueSellingPoints.length === 0 && (
            <div className="mt-6 text-center py-8 rounded-2xl bg-white border-2 border-dashed border-[#0B1D3A]/10">
              <p className="text-[#0B1D3A]/30 text-sm">
                Il tuo profilo è ancora vuoto. Passa alla tab &quot;Modifica&quot; per compilarlo!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/*  Shared UI helpers                                                      */
/* ====================================================================== */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#0B1D3A]/5 bg-white p-6 space-y-4">
      <div>
        <h2 className="text-lg font-heading text-[#0B1D3A]">{title}</h2>
        {description && <p className="text-sm text-[#0B1D3A]/40 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function CharCount({ current, max, min }: { current: number; max: number; min?: number }) {
  const tooShort = min && current > 0 && current < min;
  return (
    <p className={`text-xs mt-1 ${tooShort ? "text-amber-500" : "text-[#0B1D3A]/25"}`}>
      {current}/{max}
      {tooShort && ` (minimo ${min})`}
    </p>
  );
}
