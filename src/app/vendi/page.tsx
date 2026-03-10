"use client";

import { useState, useRef, useCallback, FormEvent, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FormData {
  // Step 1 - Immobile
  tipoImmobile: string;
  indirizzo: string;
  citta: string;
  provincia: string;
  cap: string;
  superficie: string;
  locali: string;
  bagni: string;
  piano: string;
  totalePiani: string;
  caratteristiche: string[];
  classeEnergetica: string;
  annoCostruzione: string;
  // Step 2 - Prezzo
  prezzo: string;
  descrizione: string;
  // Step 4 - Dati personali
  nomeCompleto: string;
  email: string;
  telefono: string;
  password: string;
  confermaPassword: string;
  accettaTermini: boolean;
}

interface PhotoItem {
  file: File;
  preview: string;
  isCover: boolean;
}

type Errors = Partial<Record<keyof FormData | "foto", string>>;

const INITIAL_FORM: FormData = {
  tipoImmobile: "",
  indirizzo: "",
  citta: "",
  provincia: "",
  cap: "",
  superficie: "",
  locali: "",
  bagni: "",
  piano: "",
  totalePiani: "",
  caratteristiche: [],
  classeEnergetica: "",
  annoCostruzione: "",
  prezzo: "",
  descrizione: "",
  nomeCompleto: "",
  email: "",
  telefono: "",
  password: "",
  confermaPassword: "",
  accettaTermini: false,
};

const STEP_LABELS = ["Immobile", "Prezzo", "Foto", "I tuoi dati"] as const;

const TIPI_IMMOBILE = [
  "Appartamento",
  "Villa",
  "Casa Indipendente",
  "Attico",
  "Mansarda",
  "Loft",
  "Terreno",
  "Negozio",
  "Ufficio",
];

const CARATTERISTICHE_OPTIONS = ["Garage", "Giardino", "Balcone", "Ascensore"];

const CLASSI_ENERGETICHE = [
  "A4",
  "A3",
  "A2",
  "A1",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "Non classificato",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPrice(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("it-IT");
}

function rawPrice(value: string): number {
  return Number(value.replace(/\D/g, "")) || 0;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function VendiPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  /* ---- Field updaters ---- */

  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const toggleCaratteristica = useCallback((item: string) => {
    setForm((prev) => {
      const has = prev.caratteristiche.includes(item);
      return {
        ...prev,
        caratteristiche: has
          ? prev.caratteristiche.filter((c) => c !== item)
          : [...prev.caratteristiche, item],
      };
    });
  }, []);

  /* ---- Photo management ---- */

  const addPhotos = useCallback((files: FileList | File[]) => {
    const accepted = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type),
    );
    setPhotos((prev) => {
      const newItems: PhotoItem[] = accepted.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        isCover: false,
      }));
      const combined = [...prev, ...newItems];
      // Ensure exactly one cover
      if (combined.length > 0 && !combined.some((p) => p.isCover)) {
        combined[0].isCover = true;
      }
      return combined;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.foto;
      return next;
    });
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      // Re-assign cover if needed
      if (copy.length > 0 && !copy.some((p) => p.isCover)) {
        copy[0].isCover = true;
      }
      return copy;
    });
  }, []);

  const setCover = useCallback((index: number) => {
    setPhotos((prev) =>
      prev.map((p, i) => ({ ...p, isCover: i === index })),
    );
  }, []);

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addPhotos(e.target.files);
      e.target.value = "";
    },
    [addPhotos],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files) addPhotos(e.dataTransfer.files);
    },
    [addPhotos],
  );

  /* ---- Validation ---- */

  function validateStep(s: number): boolean {
    const errs: Errors = {};

    if (s === 1) {
      if (!form.tipoImmobile) errs.tipoImmobile = "Seleziona il tipo di immobile";
      if (!form.indirizzo.trim()) errs.indirizzo = "Inserisci l'indirizzo";
      if (!form.citta.trim()) errs.citta = "Inserisci la citta";
      if (!form.provincia.trim()) errs.provincia = "Inserisci la provincia";
      else if (form.provincia.trim().length !== 2)
        errs.provincia = "La provincia deve essere di 2 caratteri";
      if (!form.cap.trim()) errs.cap = "Inserisci il CAP";
      else if (!/^\d{5}$/.test(form.cap.trim()))
        errs.cap = "Il CAP deve essere di 5 cifre";
      if (!form.superficie) errs.superficie = "Inserisci la superficie";
      if (!form.locali) errs.locali = "Inserisci il numero di locali";
      if (!form.bagni) errs.bagni = "Inserisci il numero di bagni";
      if (!form.classeEnergetica)
        errs.classeEnergetica = "Seleziona la classe energetica";
    }

    if (s === 2) {
      if (!form.prezzo || rawPrice(form.prezzo) === 0)
        errs.prezzo = "Inserisci il prezzo richiesto";
      if (form.descrizione.length > 2000)
        errs.descrizione = "La descrizione non puo superare i 2000 caratteri";
    }

    if (s === 3) {
      if (photos.length < 3)
        errs.foto = "Carica almeno 3 foto del tuo immobile";
    }

    if (s === 4) {
      if (!form.nomeCompleto.trim())
        errs.nomeCompleto = "Inserisci il tuo nome completo";
      if (!form.email.trim()) errs.email = "Inserisci la tua email";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
        errs.email = "Inserisci un indirizzo email valido";
      if (!form.telefono.trim()) errs.telefono = "Inserisci il tuo telefono";
      if (!form.password) errs.password = "Inserisci una password";
      else if (form.password.length < 8)
        errs.password = "La password deve essere di almeno 8 caratteri";
      if (!form.confermaPassword)
        errs.confermaPassword = "Conferma la password";
      else if (form.password !== form.confermaPassword)
        errs.confermaPassword = "Le password non coincidono";
      if (!form.accettaTermini)
        errs.accettaTermini = "Devi accettare la Privacy Policy e i Termini di Servizio";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /* ---- Navigation ---- */

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 4));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 1));
  }

  /* ---- Submit ---- */

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep(4)) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      // 1. Create account
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.nomeCompleto,
          email: form.email,
          phone: form.telefono,
          password: form.password,
        }),
      });

      if (!registerRes.ok) {
        const data = await registerRes.json().catch(() => ({}));
        throw new Error(data.message || "Errore durante la registrazione.");
      }

      // 2. Create property
      const propertyPayload = new FormData();
      propertyPayload.append("tipoImmobile", form.tipoImmobile);
      propertyPayload.append("indirizzo", form.indirizzo);
      propertyPayload.append("citta", form.citta);
      propertyPayload.append("provincia", form.provincia.toUpperCase());
      propertyPayload.append("cap", form.cap);
      propertyPayload.append("superficie", form.superficie);
      propertyPayload.append("locali", form.locali);
      propertyPayload.append("bagni", form.bagni);
      if (form.piano) propertyPayload.append("piano", form.piano);
      if (form.totalePiani) propertyPayload.append("totalePiani", form.totalePiani);
      propertyPayload.append(
        "caratteristiche",
        JSON.stringify(form.caratteristiche),
      );
      propertyPayload.append("classeEnergetica", form.classeEnergetica);
      if (form.annoCostruzione)
        propertyPayload.append("annoCostruzione", form.annoCostruzione);
      propertyPayload.append("prezzo", String(rawPrice(form.prezzo)));
      if (form.descrizione)
        propertyPayload.append("descrizione", form.descrizione);

      photos.forEach((p, i) => {
        propertyPayload.append("foto", p.file);
        if (p.isCover) propertyPayload.append("coverIndex", String(i));
      });

      const propertyRes = await fetch("/api/properties", {
        method: "POST",
        body: propertyPayload,
      });

      if (!propertyRes.ok) {
        const data = await propertyRes.json().catch(() => ({}));
        throw new Error(
          data.message || "Errore durante la pubblicazione dell'immobile.",
        );
      }

      router.push("/grazie");
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Si e verificato un errore. Riprova.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ---- Computed ---- */

  const prezzoNumerico = rawPrice(form.prezzo);
  const commissioneAgenzia = Math.round(prezzoNumerico * 0.03);

  /* ------------------------------------------------------------------ */
  /*  Reusable UI pieces                                                */
  /* ------------------------------------------------------------------ */

  function Label({
    htmlFor,
    required,
    children,
  }: {
    htmlFor: string;
    required?: boolean;
    children: React.ReactNode;
  }) {
    return (
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-sm font-medium text-text"
      >
        {children}
        {required && <span className="ml-0.5 text-error">*</span>}
      </label>
    );
  }

  function FieldError({ field }: { field: keyof FormData | "foto" }) {
    if (!errors[field]) return null;
    return (
      <p className="mt-1 text-xs text-error">{errors[field]}</p>
    );
  }

  const inputBase =
    "w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-text placeholder:text-text-muted/60 transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none";

  function inputClass(field: keyof FormData) {
    return `${inputBase} ${errors[field] ? "border-error" : "border-border"}`;
  }

  /* ------------------------------------------------------------------ */
  /*  Step renderers                                                     */
  /* ------------------------------------------------------------------ */

  function renderStep1() {
    return (
      <div className="space-y-5">
        {/* Tipo immobile */}
        <div>
          <Label htmlFor="tipoImmobile" required>
            Tipo immobile
          </Label>
          <select
            id="tipoImmobile"
            value={form.tipoImmobile}
            onChange={(e) => updateField("tipoImmobile", e.target.value)}
            className={inputClass("tipoImmobile")}
          >
            <option value="">Seleziona...</option>
            {TIPI_IMMOBILE.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <FieldError field="tipoImmobile" />
        </div>

        {/* Indirizzo */}
        <div>
          <Label htmlFor="indirizzo" required>
            Indirizzo completo
          </Label>
          <input
            id="indirizzo"
            type="text"
            placeholder="Inizia a digitare l'indirizzo..."
            value={form.indirizzo}
            onChange={(e) => updateField("indirizzo", e.target.value)}
            className={inputClass("indirizzo")}
          />
          <FieldError field="indirizzo" />
        </div>

        {/* Citta / Provincia / CAP */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="citta" required>
              Citta
            </Label>
            <input
              id="citta"
              type="text"
              value={form.citta}
              onChange={(e) => updateField("citta", e.target.value)}
              className={inputClass("citta")}
            />
            <FieldError field="citta" />
          </div>
          <div>
            <Label htmlFor="provincia" required>
              Provincia
            </Label>
            <input
              id="provincia"
              type="text"
              maxLength={2}
              placeholder="es. MI"
              value={form.provincia}
              onChange={(e) =>
                updateField("provincia", e.target.value.toUpperCase())
              }
              className={inputClass("provincia")}
            />
            <FieldError field="provincia" />
          </div>
          <div>
            <Label htmlFor="cap" required>
              CAP
            </Label>
            <input
              id="cap"
              type="text"
              maxLength={5}
              placeholder="es. 20100"
              value={form.cap}
              onChange={(e) =>
                updateField("cap", e.target.value.replace(/\D/g, ""))
              }
              className={inputClass("cap")}
            />
            <FieldError field="cap" />
          </div>
        </div>

        {/* Superficie / Locali / Bagni */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="superficie" required>
              Superficie mq
            </Label>
            <input
              id="superficie"
              type="number"
              min={1}
              value={form.superficie}
              onChange={(e) => updateField("superficie", e.target.value)}
              className={inputClass("superficie")}
            />
            <FieldError field="superficie" />
          </div>
          <div>
            <Label htmlFor="locali" required>
              N. locali
            </Label>
            <input
              id="locali"
              type="number"
              min={1}
              value={form.locali}
              onChange={(e) => updateField("locali", e.target.value)}
              className={inputClass("locali")}
            />
            <FieldError field="locali" />
          </div>
          <div>
            <Label htmlFor="bagni" required>
              N. bagni
            </Label>
            <input
              id="bagni"
              type="number"
              min={1}
              value={form.bagni}
              onChange={(e) => updateField("bagni", e.target.value)}
              className={inputClass("bagni")}
            />
            <FieldError field="bagni" />
          </div>
        </div>

        {/* Piano / Totale piani */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="piano">Piano</Label>
            <input
              id="piano"
              type="number"
              min={0}
              value={form.piano}
              onChange={(e) => updateField("piano", e.target.value)}
              className={inputClass("piano")}
            />
          </div>
          <div>
            <Label htmlFor="totalePiani">Totale piani edificio</Label>
            <input
              id="totalePiani"
              type="number"
              min={1}
              value={form.totalePiani}
              onChange={(e) => updateField("totalePiani", e.target.value)}
              className={inputClass("totalePiani")}
            />
          </div>
        </div>

        {/* Caratteristiche */}
        <div>
          <span className="mb-2 block text-sm font-medium text-text">
            Caratteristiche
          </span>
          <div className="flex flex-wrap gap-3">
            {CARATTERISTICHE_OPTIONS.map((c) => {
              const checked = form.caratteristiche.includes(c);
              return (
                <label
                  key={c}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                    checked
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-white text-text-muted hover:border-primary/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggleCaratteristica(c)}
                  />
                  <svg
                    className={`h-4 w-4 ${checked ? "text-primary" : "text-border"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    {checked ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    ) : (
                      <circle cx="12" cy="12" r="9" />
                    )}
                  </svg>
                  {c}
                </label>
              );
            })}
          </div>
        </div>

        {/* Classe energetica */}
        <div>
          <Label htmlFor="classeEnergetica" required>
            Classe energetica
          </Label>
          <select
            id="classeEnergetica"
            value={form.classeEnergetica}
            onChange={(e) => updateField("classeEnergetica", e.target.value)}
            className={inputClass("classeEnergetica")}
          >
            <option value="">Seleziona...</option>
            {CLASSI_ENERGETICHE.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <FieldError field="classeEnergetica" />
        </div>

        {/* Anno costruzione */}
        <div>
          <Label htmlFor="annoCostruzione">Anno costruzione</Label>
          <input
            id="annoCostruzione"
            type="number"
            min={1800}
            max={new Date().getFullYear()}
            placeholder="es. 2005"
            value={form.annoCostruzione}
            onChange={(e) => updateField("annoCostruzione", e.target.value)}
            className={inputClass("annoCostruzione")}
          />
        </div>
      </div>
    );
  }

  function renderStep2() {
    return (
      <div className="space-y-6">
        {/* Prezzo */}
        <div>
          <Label htmlFor="prezzo" required>
            Prezzo richiesto (&euro;)
          </Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-text-muted">
              &euro;
            </span>
            <input
              id="prezzo"
              type="text"
              inputMode="numeric"
              placeholder="es. 250.000"
              value={form.prezzo}
              onChange={(e) =>
                updateField("prezzo", formatPrice(e.target.value))
              }
              className={`${inputClass("prezzo")} pl-10 text-lg font-semibold`}
            />
          </div>
          <FieldError field="prezzo" />
        </div>

        {/* Info box */}
        {prezzoNumerico > 0 && (
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20">
                <svg
                  className="h-4 w-4 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm leading-relaxed text-text">
                  Con un&apos;agenzia tradizionale pagheresti circa{" "}
                  <span className="font-bold text-error">
                    &euro;{commissioneAgenzia.toLocaleString("it-IT")}
                  </span>{" "}
                  di commissione (3%).
                </p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  Con Privatio risparmi il 100%.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Descrizione */}
        <div>
          <Label htmlFor="descrizione">Descrizione immobile</Label>
          <textarea
            id="descrizione"
            rows={6}
            maxLength={2000}
            placeholder="Descrivi il tuo immobile: punti di forza, stato degli interni, vicinanza a servizi..."
            value={form.descrizione}
            onChange={(e) => updateField("descrizione", e.target.value)}
            className={inputClass("descrizione")}
          />
          <div className="mt-1 flex items-center justify-between">
            <FieldError field="descrizione" />
            <span className="text-xs text-text-muted">
              {form.descrizione.length}/2000
            </span>
          </div>
        </div>
      </div>
    );
  }

  function renderStep3() {
    return (
      <div className="space-y-6">
        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-bg-soft hover:border-primary/40"
          }`}
        >
          <svg
            className="mb-3 h-10 w-10 text-text-muted/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-sm font-medium text-text">
            Trascina le foto qui oppure{" "}
            <span className="text-primary underline">sfoglia</span>
          </p>
          <p className="mt-1 text-xs text-text-muted">
            JPG, PNG o WebP
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {/* Count */}
        <p
          className={`text-sm font-medium ${
            photos.length < 3 ? "text-error" : "text-success"
          }`}
        >
          {photos.length} foto caricate (minimo 3)
        </p>
        <FieldError field="foto" />

        {/* Preview grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={`${photo.file.name}-${index}`}
                className="group relative overflow-hidden rounded-lg border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.preview}
                  alt={`Foto ${index + 1}`}
                  className="aspect-[4/3] w-full object-cover"
                />

                {/* Cover badge */}
                {photo.isCover && (
                  <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow">
                    Copertina
                  </span>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  {!photo.isCover && (
                    <button
                      type="button"
                      onClick={() => setCover(index)}
                      className="rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-text shadow-sm hover:bg-white"
                    >
                      Imposta copertina
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-error/90 text-white shadow-sm hover:bg-error"
                    aria-label="Rimuovi foto"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderStep4() {
    return (
      <div className="space-y-5">
        {/* Nome completo */}
        <div>
          <Label htmlFor="nomeCompleto" required>
            Nome completo
          </Label>
          <input
            id="nomeCompleto"
            type="text"
            placeholder="Mario Rossi"
            value={form.nomeCompleto}
            onChange={(e) => updateField("nomeCompleto", e.target.value)}
            className={inputClass("nomeCompleto")}
          />
          <FieldError field="nomeCompleto" />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" required>
            Email
          </Label>
          <input
            id="email"
            type="email"
            placeholder="mario.rossi@email.com"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={inputClass("email")}
          />
          <FieldError field="email" />
        </div>

        {/* Telefono */}
        <div>
          <Label htmlFor="telefono" required>
            Telefono
          </Label>
          <input
            id="telefono"
            type="tel"
            placeholder="+39 333 1234567"
            value={form.telefono}
            onChange={(e) => updateField("telefono", e.target.value)}
            className={inputClass("telefono")}
          />
          <FieldError field="telefono" />
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" required>
            Password
          </Label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimo 8 caratteri"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className={`${inputClass("password")} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              aria-label={showPassword ? "Nascondi password" : "Mostra password"}
            >
              {showPassword ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          </div>
          <FieldError field="password" />
        </div>

        {/* Conferma password */}
        <div>
          <Label htmlFor="confermaPassword" required>
            Conferma password
          </Label>
          <div className="relative">
            <input
              id="confermaPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Ripeti la password"
              value={form.confermaPassword}
              onChange={(e) =>
                updateField("confermaPassword", e.target.value)
              }
              className={`${inputClass("confermaPassword")} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              aria-label={
                showConfirmPassword ? "Nascondi password" : "Mostra password"
              }
            >
              {showConfirmPassword ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          </div>
          <FieldError field="confermaPassword" />
        </div>

        {/* Accetta termini */}
        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.accettaTermini}
              onChange={(e) =>
                updateField("accettaTermini", e.target.checked)
              }
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-muted">
              Accetto la{" "}
              <Link
                href="/privacy-policy"
                className="font-medium text-primary underline hover:text-primary-dark"
                target="_blank"
              >
                Privacy Policy
              </Link>{" "}
              e i{" "}
              <Link
                href="/termini-di-servizio"
                className="font-medium text-primary underline hover:text-primary-dark"
                target="_blank"
              >
                Termini di Servizio
              </Link>
              <span className="ml-0.5 text-error">*</span>
            </span>
          </label>
          <FieldError field="accettaTermini" />
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Main render                                                        */
  /* ------------------------------------------------------------------ */

  return (
    <>
      <Header />

      <main className="min-h-screen bg-bg-soft pt-24 pb-16 md:pt-28">
        <div className="mx-auto max-w-[700px] px-4 sm:px-6">
          {/* ---- Title ---- */}
          <div className="mb-8 text-center">
            <h1 className="font-heading text-3xl uppercase tracking-wide text-primary-dark md:text-4xl">
              Vendi il tuo immobile
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-muted">
              Inserisci i dati del tuo immobile. &Egrave; gratis e richiede solo
              pochi minuti.
            </p>
          </div>

          {/* ---- Progress bar ---- */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEP_LABELS.map((label, i) => {
                const num = i + 1;
                const isActive = num === step;
                const isCompleted = num < step;
                return (
                  <div
                    key={label}
                    className="flex flex-1 flex-col items-center"
                  >
                    <div className="flex w-full items-center">
                      {/* Connector left */}
                      {i > 0 && (
                        <div
                          className={`h-0.5 flex-1 transition-colors ${
                            isCompleted || isActive
                              ? "bg-primary"
                              : "bg-border"
                          }`}
                        />
                      )}
                      {/* Circle */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-primary text-white shadow-md shadow-primary/30"
                            : isCompleted
                              ? "bg-primary text-white"
                              : "bg-bg-soft text-text-muted ring-1 ring-border"
                        }`}
                      >
                        {isCompleted ? (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          num
                        )}
                      </div>
                      {/* Connector right */}
                      {i < STEP_LABELS.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 transition-colors ${
                            isCompleted ? "bg-primary" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-[11px] font-medium sm:text-xs ${
                        isActive
                          ? "text-primary"
                          : isCompleted
                            ? "text-primary-dark"
                            : "text-text-muted"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---- Card ---- */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-2xl border border-border bg-white p-6 shadow-lg sm:p-8"
          >
            {/* Step title */}
            <h2 className="mb-6 text-lg font-semibold text-primary-dark">
              {step === 1 && "L'immobile"}
              {step === 2 && "Il prezzo"}
              {step === 3 && "Le foto"}
              {step === 4 && "I tuoi dati"}
            </h2>

            {/* Step content */}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            {/* Submit error */}
            {submitError && (
              <div className="mt-5 rounded-lg border border-error/30 bg-error/5 p-4">
                <p className="text-sm text-error">{submitError}</p>
              </div>
            )}

            {/* ---- Buttons ---- */}
            <div className="mt-8 flex items-center justify-between gap-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prev}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-2.5 text-sm font-medium text-text-muted transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Indietro
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={step === 3 && photos.length < 3}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Avanti
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Pubblicazione in corso...
                    </>
                  ) : (
                    <>
                      Pubblica Immobile
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* ---- Loading overlay ---- */}
      {submitting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-dark/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl">
            <svg
              className="h-10 w-10 animate-spin text-primary"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-sm font-medium text-primary-dark">
              Stiamo pubblicando il tuo immobile...
            </p>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
