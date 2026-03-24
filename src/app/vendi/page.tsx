"use client";

import { useState, useRef, useCallback, useEffect, FormEvent, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
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
  // Step 2 - Prezzo e dettagli
  prezzo: string;
  descrizione: string;
  speseCondominiali: string;
  costiExtra: string;
  statoImmobile: string;
  riscaldamento: string;
  // Step 4 - Dati personali
  nomeCompleto: string;
  email: string;
  telefono: string;
  password: string;
  confermaPassword: string;
  // Step 5 - Termini e condizioni
  accettaTermini: boolean;
  accettaPrivacy: boolean;
  accettaFase2: boolean;
  accettaClausole: boolean;
  accettaMarketing: boolean;
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
  speseCondominiali: "",
  costiExtra: "",
  statoImmobile: "",
  riscaldamento: "",
  nomeCompleto: "",
  email: "",
  telefono: "",
  password: "",
  confermaPassword: "",
  accettaTermini: false,
  accettaPrivacy: false,
  accettaFase2: false,
  accettaClausole: false,
  accettaMarketing: false,
};

const ALL_STEPS = [
  { num: 1, label: "Immobile" },
  { num: 2, label: "Prezzo" },
  { num: 3, label: "Foto" },
  { num: 4, label: "I tuoi dati" },
  { num: 5, label: "Termini" },
] as const;

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

const CARATTERISTICHE_OPTIONS = [
  "Garage",
  "Posto auto",
  "Giardino",
  "Balcone",
  "Terrazza",
  "Ascensore",
  "Cantina",
  "Piscina",
  "Aria condizionata",
  "Arredato",
  "Portineria",
  "Allarme",
];

const STATO_IMMOBILE_OPTIONS = ["Nuovo", "Ottimo", "Buono", "Da ristrutturare"];

const RISCALDAMENTO_OPTIONS = [
  "Autonomo",
  "Centralizzato",
  "Pavimento radiante",
  "Assente",
];

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
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [capLoading, setCapLoading] = useState(false);
  const lastLookedUpCap = useRef("");

  /* ---- Auto-fill città/provincia da CAP ---- */

  useEffect(() => {
    const cap = form.cap.trim();
    if (!/^\d{5}$/.test(cap) || cap === lastLookedUpCap.current) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setCapLoading(true);
      try {
        const res = await fetch(`/api/address/lookup-by-cap?cap=${cap}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          lastLookedUpCap.current = cap;
          setForm((prev) => ({
            ...prev,
            citta: data.city || prev.citta,
            provincia: data.province || prev.provincia,
          }));
          setErrors((prev) => {
            const next = { ...prev };
            delete next.citta;
            delete next.provincia;
            return next;
          });
        }
      } catch {
        // ignore abort / network errors
      } finally {
        setCapLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form.cap]);

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
    }

    if (s === 2) {
      if (!form.prezzo || rawPrice(form.prezzo) === 0)
        errs.prezzo = "Inserisci il prezzo richiesto";
      if (form.descrizione.length > 2000)
        errs.descrizione = "La descrizione non può superare i 2000 caratteri";
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
    }

    if (s === 5) {
      if (!form.accettaTermini)
        errs.accettaTermini = "Devi accettare i Termini e Condizioni del Servizio";
      if (!form.accettaPrivacy)
        errs.accettaPrivacy = "Devi accettare l'Informativa sulla Privacy";
      if (!form.accettaFase2)
        errs.accettaFase2 = "Devi acconsentire alla trasmissione automatica dei dati";
      if (!form.accettaClausole)
        errs.accettaClausole = "Devi approvare le clausole ai sensi degli artt. 1341 e 1342 c.c.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /* ---- Navigation ---- */

  function next() {
    if (!validateStep(step)) return;
    setStep((s) => {
      let nextStep = s + 1;
      // Skip step 4 (dati personali) if already logged in
      if (isLoggedIn && nextStep === 4) nextStep = 5;
      return Math.min(nextStep, 5);
    });
  }

  function prev() {
    setStep((s) => {
      let prevStep = s - 1;
      // Skip step 4 (dati personali) if already logged in
      if (isLoggedIn && prevStep === 4) prevStep = 3;
      return Math.max(prevStep, 1);
    });
  }

  /* ---- Submit ---- */

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep(5)) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      // If not logged in, create account and auto-login first
      if (!isLoggedIn) {
        // 1. Create account
        const registerRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.nomeCompleto,
            email: form.email,
            phone: form.telefono,
            password: form.password,
            accettaTermini: form.accettaTermini,
            accettaPrivacy: form.accettaPrivacy,
            accettaFase2: form.accettaFase2,
            accettaClausole: form.accettaClausole,
            accettaMarketing: form.accettaMarketing,
            termsVersion: "2.0",
          }),
        });

        if (!registerRes.ok) {
          const data = await registerRes.json().catch(() => ({}));
          throw new Error(data.error || data.message || "Errore durante la registrazione.");
        }

        // 2. Auto-login to establish session (required for property creation)
        const loginResult = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (loginResult?.error) {
          throw new Error("Registrazione riuscita ma accesso fallito. Accedi manualmente e riprova.");
        }
      }

      // 3. Create property
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
      if (form.speseCondominiali)
        propertyPayload.append("speseCondominiali", form.speseCondominiali);
      if (form.costiExtra)
        propertyPayload.append("costiExtra", form.costiExtra);
      if (form.statoImmobile)
        propertyPayload.append("statoImmobile", form.statoImmobile);
      if (form.riscaldamento)
        propertyPayload.append("riscaldamento", form.riscaldamento);

      // Consent metadata
      propertyPayload.append("accettaTermini", String(form.accettaTermini));
      propertyPayload.append("accettaPrivacy", String(form.accettaPrivacy));
      propertyPayload.append("accettaFase2", String(form.accettaFase2));
      propertyPayload.append("accettaClausole", String(form.accettaClausole));
      propertyPayload.append("accettaMarketing", String(form.accettaMarketing));
      propertyPayload.append("termsVersion", "2.0");

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
          data.error || "Errore durante la pubblicazione dell'immobile.",
        );
      }

      router.push("/grazie");
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Si è verificato un errore. Riprova.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ---- Computed ---- */

  const prezzoNumerico = rawPrice(form.prezzo);
  const commissioneAgenzia = Math.round(prezzoNumerico * 0.03);

  // Steps visibili: utenti loggati saltano step 4 (dati personali)
  const visibleSteps = isLoggedIn
    ? ALL_STEPS.filter((s) => s.num !== 4)
    : [...ALL_STEPS];

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
    "w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-text placeholder:text-text-muted/60 transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none";

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

        {/* Città / Provincia / CAP */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="citta" required>
              Città
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
            <div className="relative">
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
              {capLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="h-4 w-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}
            </div>
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
            <Label htmlFor="bagni">
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
          <Label htmlFor="classeEnergetica">
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
                  <span className="font-semibold text-error">
                    &euro;{commissioneAgenzia.toLocaleString("it-IT")}
                  </span>{" "}
                  di commissione (3%).
                </p>
                <p className="mt-1 text-sm font-medium text-primary">
                  Con Privatio risparmi il 100%.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stato immobile / Riscaldamento */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="statoImmobile">Stato immobile</Label>
            <select
              id="statoImmobile"
              value={form.statoImmobile}
              onChange={(e) => updateField("statoImmobile", e.target.value)}
              className={inputClass("statoImmobile")}
            >
              <option value="">Seleziona...</option>
              {STATO_IMMOBILE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="riscaldamento">Riscaldamento</Label>
            <select
              id="riscaldamento"
              value={form.riscaldamento}
              onChange={(e) => updateField("riscaldamento", e.target.value)}
              className={inputClass("riscaldamento")}
            >
              <option value="">Seleziona...</option>
              {RISCALDAMENTO_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Spese condominiali */}
        <div>
          <Label htmlFor="speseCondominiali">Spese condominiali</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-text-muted">
              &euro;
            </span>
            <input
              id="speseCondominiali"
              type="number"
              min={0}
              placeholder="es. 150"
              value={form.speseCondominiali}
              onChange={(e) => updateField("speseCondominiali", e.target.value)}
              className={`${inputClass("speseCondominiali")} pl-10`}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-muted">
              /mese
            </span>
          </div>
        </div>

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

        {/* Costi extra */}
        <div>
          <Label htmlFor="costiExtra">Costi aggiuntivi</Label>
          <textarea
            id="costiExtra"
            rows={3}
            maxLength={500}
            placeholder="Eventuali spese extra (es. lavori straordinari previsti, costi di ristrutturazione...)"
            value={form.costiExtra}
            onChange={(e) => updateField("costiExtra", e.target.value)}
            className={inputClass("costiExtra")}
          />
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
                  <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold text-white shadow">
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

      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Step 5 – Termini e condizioni                                      */
  /* ------------------------------------------------------------------ */

  function renderStep5() {
    return (
      <div className="space-y-6">
        {/* Quick summary — what you need to know */}
        <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-5">
          <h3 className="text-base font-medium text-primary-dark mb-3 flex items-center gap-2">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            In breve
          </h3>
          <ul className="space-y-2 text-sm text-text">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>Pubblicare il tuo immobile su Privatio è <strong>completamente gratuito</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>Privatio <strong>non è un&apos;agenzia immobiliare</strong> e non percepisce provvigioni sulle vendite</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>Nelle prime <strong>48 ore</strong> i tuoi dati personali restano privati: sei tu a scegliere chi contattare</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>Dopo 48 ore senza contatto, i tuoi dati vengono condivisi con le agenzie della zona</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>Puoi <strong>rimuovere l&apos;annuncio</strong> e i tuoi dati in qualsiasi momento dalla dashboard</span>
            </li>
          </ul>
        </div>

        {/* Expandable full contract */}
        <div className="rounded-xl border border-border bg-bg-soft overflow-hidden">
          <button
            type="button"
            onClick={() => setShowFullTerms(!showFullTerms)}
            className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-white/50 transition-colors"
          >
            <span className="text-sm font-medium text-text-muted">Leggi il testo completo dei Termini e Privacy</span>
            <svg
              className={`h-4 w-4 text-text-muted transition-transform ${showFullTerms ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showFullTerms && (
            <div className="max-h-[400px] overflow-y-auto border-t border-border bg-white p-5 text-[13px] leading-relaxed text-text">
              <h3 className="mb-3 text-center text-sm font-semibold text-primary-dark">
                TERMINI E CONDIZIONI DI SERVIZIO &mdash; UTENTE VENDITORE
              </h3>
              <p className="mb-2 text-xs text-text-muted text-center">Versione 2.0 &mdash; Marzo 2026</p>

              <p className="mb-3 text-xs text-text-muted">
                Il presente documento disciplina i termini di utilizzo della piattaforma Privatio da parte del Venditore.
                L&apos;accettazione avviene in forma digitale mediante selezione della casella di conferma, con registrazione di IP, data/ora e email.
              </p>

              <h4 className="mb-1.5 mt-4 text-xs font-semibold text-primary-dark">Art. 1 &mdash; Natura del servizio</h4>
              <p className="mb-1.5">
                Privatio fornisce un servizio tecnologico di vetrina digitale: il Venditore carica l&apos;immobile, visualizza le agenzie convenzionate nella zona e pu&ograve; contattarle.
                Se non contatta nessuna agenzia entro 48 ore, i suoi dati vengono trasmessi automaticamente alle agenzie della zona.
              </p>
              <p className="mb-3">
                Privatio <strong>NON &egrave; un&apos;agenzia immobiliare</strong> ai sensi della L. 39/1989: non media, non partecipa alle trattative, non percepisce provvigioni.
                Il servizio &egrave; gratuito per il Venditore. La Piattaforma non fornisce valutazioni o stime immobiliari.
              </p>

              <h4 className="mb-1.5 mt-4 text-xs font-semibold text-primary-dark">Art. 2 &mdash; Registrazione e pubblicazione</h4>
              <p className="mb-3">
                Il Venditore deve creare un account con email verificata, compilare la scheda immobiliare e accettare i Termini.
                Dichiara che le informazioni sono veritiere e che &egrave; legittimamente autorizzato a disporre dell&apos;immobile.
                Privatio si riserva di verificare e rimuovere annunci falsi o in violazione.
              </p>

              <h4 className="mb-1.5 mt-4 text-xs font-semibold text-primary-dark">Art. 3 &mdash; Visibilit&agrave; dei dati</h4>
              <p className="mb-1.5">
                <strong>Fase 1 (0&ndash;48 ore):</strong> Le informazioni dell&apos;immobile sono visibili, ma i dati personali del Venditore NO.
                Il Venditore sceglie chi contattare.
              </p>
              <p className="mb-1.5">
                <strong>Fase 2 (dopo 48 ore):</strong> Se il Venditore non contatta nessuna agenzia, i suoi dati vengono trasmessi automaticamente
                alle agenzie della zona (previo consenso specifico). Il Venditore pu&ograve; revocare questo consenso in qualsiasi momento dalla dashboard.
              </p>
              <p className="mb-3">
                I dati NON saranno pubblicati su siti pubblici. Le agenzie sono vincolate da obblighi di riservatezza.
              </p>

              <h4 className="mb-1.5 mt-4 text-xs font-semibold text-primary-dark">Art. 4 &mdash; Diritto di rimozione</h4>
              <p className="mb-3">
                L&apos;annuncio pu&ograve; essere rimosso in qualsiasi momento, senza preavviso n&eacute; penali, tramite dashboard o email.
                I dati cessano di essere visibili entro 24 ore e vengono cancellati entro 30 giorni.
              </p>

              <h4 className="mb-1.5 mt-4 text-xs font-semibold text-primary-dark">Art. 5 &mdash; Obblighi del Venditore</h4>
              <p className="mb-3">
                Fornire informazioni veritiere e aggiornate, rimuovere l&apos;annuncio se l&apos;immobile non &egrave; pi&ugrave; disponibile,
                non utilizzare la Piattaforma per finalit&agrave; illecite. Il Venditore &egrave; l&apos;unico responsabile dei contenuti pubblicati.
              </p>

              <h4 className="mb-1.5 mt-4 text-xs font-semibold text-primary-dark">Art. 5-bis &mdash; Usi vietati</h4>
              <p className="mb-3">
                Vietato: pubblicare immobili inesistenti, fare scraping/data mining, usare bot, contattare agenzie fuori piattaforma con dati ottenuti tramite essa,
                creare account multipli, svolgere attivit&agrave; di mediazione.
              </p>

              <h4 className="mb-1.5 mt-4 text-xs font-semibold text-primary-dark">Art. 6 &mdash; Limitazione di responsabilit&agrave;</h4>
              <p className="mb-3">
                Privatio non garantisce la conclusione di vendite. Non &egrave; responsabile per il comportamento delle agenzie,
                interruzioni della Piattaforma o danni indiretti. Le agenzie sono soggetti indipendenti.
                Responsabilit&agrave; massima: corrispettivi versati nei 12 mesi precedenti o &euro;100 se servizio gratuito.
              </p>

              <h4 className="mb-1.5 mt-4 text-xs font-semibold text-primary-dark">Art. 6-bis &mdash; Manleva</h4>
              <p className="mb-3">
                Il Venditore manleva Privatio da pretese derivanti da informazioni false, violazione dei Termini,
                violazione di diritti di terzi e controversie con le agenzie. La manleva dura 24 mesi dopo la cessazione del rapporto.
              </p>

              <h4 className="mb-1.5 mt-4 text-xs font-semibold text-primary-dark">Art. 7 &mdash; Propriet&agrave; intellettuale</h4>
              <p className="mb-3">
                Il Venditore mantiene la propriet&agrave; dei contenuti caricati e concede a Privatio una licenza limitata per mostrarli alle agenzie,
                creare copie tecniche e statistiche anonimizzate. La licenza si estingue con la rimozione dell&apos;annuncio.
              </p>

              <h4 className="mb-1.5 mt-4 text-xs font-semibold text-primary-dark">Art. 8 &mdash; Durata e recesso</h4>
              <p className="mb-3">
                Durata indeterminata. Il Venditore pu&ograve; recedere in qualsiasi momento cancellando l&apos;account.
                Privatio pu&ograve; sospendere l&apos;account per violazioni, con preavviso di 15 giorni (salvo gravi violazioni).
              </p>

              <h4 className="mb-1.5 mt-4 text-xs font-semibold text-primary-dark">Art. 9 &mdash; Modifiche ai termini</h4>
              <p className="mb-3">
                Le modifiche sostanziali saranno comunicate via email almeno 30 giorni prima. L&apos;uso continuato dopo le modifiche costituisce accettazione.
              </p>

              <hr className="my-4 border-border" />

              <h3 className="mb-3 text-center text-sm font-semibold text-primary-dark">
                INFORMATIVA SULLA PRIVACY
              </h3>
              <p className="mb-1.5">
                <strong>Finalit&agrave;:</strong> erogazione del servizio (pubblicazione immobile, condivisione con agenzie), comunicazioni di servizio, marketing (solo con consenso).
              </p>
              <p className="mb-1.5">
                <strong>Base giuridica:</strong> esecuzione del contratto (servizio), consenso (marketing).
              </p>
              <p className="mb-1.5">
                <strong>Destinatari:</strong> agenzie convenzionate (su iniziativa del Venditore o automaticamente dopo 48 ore), fornitori tecnici.
                I dati NON saranno ceduti a terzi per marketing.
              </p>
              <p className="mb-1.5">
                <strong>Conservazione:</strong> per la durata dell&apos;account + 30 giorni dopo la rimozione (dati tecnici fino a 10 anni per obblighi fiscali).
              </p>
              <p className="mb-3">
                <strong>Diritti:</strong> accesso, rettifica, cancellazione, portabilit&agrave;, opposizione. Scrivi a <strong>privacy@privatio.it</strong>.
              </p>

              <hr className="my-4 border-border" />

              <h4 className="mb-1.5 mt-4 text-xs font-semibold text-primary-dark">Art. 10 &mdash; Legge applicabile</h4>
              <p className="mb-3">
                Legge italiana. Mediazione obbligatoria prima del contenzioso. Foro di Torino, salvo foro del consumatore.
              </p>

              <h4 className="mb-1.5 mt-4 text-xs font-semibold text-primary-dark">Art. 12 &mdash; Approvazione specifica (artt. 1341-1342 c.c.)</h4>
              <p className="mb-1.5">
                Il Venditore approva specificamente: Art. 1 (Natura del servizio), Art. 3 (Visibilit&agrave; dati e trasmissione automatica),
                Art. 4 (Rimozione), Art. 5 e 5-bis (Obblighi e usi vietati), Art. 6 e 6-bis (Limitazione responsabilit&agrave; e manleva),
                Art. 7 (Propriet&agrave; intellettuale), Art. 8 (Durata e recesso), Art. 9 (Modifiche), Art. 10 (Foro competente).
              </p>

              <p className="mt-4 text-center text-xs text-text-muted">
                Documenti completi: <Link href="/termini-di-servizio" className="text-primary underline" target="_blank">Termini di Servizio</Link> &middot; <Link href="/privacy-policy" className="text-primary underline" target="_blank">Privacy Policy</Link>
              </p>
            </div>
          )}
        </div>

        {/* Checkboxes — clean and fast */}
        <div className="space-y-3">
          {/* Checkbox 1: Termini e Condizioni (obbligatorio) */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.accettaTermini}
                onChange={(e) => updateField("accettaTermini", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text">
                Ho letto e accetto i <Link href="/termini-di-servizio" className="text-primary underline font-medium" target="_blank">Termini e Condizioni del Servizio</Link>
                <span className="ml-0.5 text-error">*</span>
              </span>
            </label>
            <FieldError field="accettaTermini" />
          </div>

          {/* Checkbox 2: Privacy Policy (obbligatorio) */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.accettaPrivacy}
                onChange={(e) => updateField("accettaPrivacy", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text">
                Ho letto e accetto l&apos;<Link href="/privacy-policy" className="text-primary underline font-medium" target="_blank">Informativa sulla Privacy</Link>
                <span className="ml-0.5 text-error">*</span>
              </span>
            </label>
            <FieldError field="accettaPrivacy" />
          </div>

          {/* Checkbox 3: Fase 2 consent (obbligatorio) */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.accettaFase2}
                onChange={(e) => updateField("accettaFase2", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text">
                Acconsento alla trasmissione automatica dei miei dati alle agenzie della zona se non contatto nessuna agenzia entro 48 ore
                <span className="ml-0.5 text-error">*</span>
              </span>
            </label>
            <FieldError field="accettaFase2" />
          </div>

          {/* Checkbox 4: Marketing (facoltativo) */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.accettaMarketing}
                onChange={(e) => updateField("accettaMarketing", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-muted">
                Acconsento a ricevere comunicazioni promozionali <em>(facoltativo)</em>
              </span>
            </label>
          </div>

          {/* Checkbox 5: Clausole vessatorie 1341/1342 c.c. (obbligatorio) */}
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.accettaClausole}
                onChange={(e) => updateField("accettaClausole", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text">
                Ai sensi degli artt. 1341 e 1342 c.c., approvo specificamente le clausole relative a:
                visibilit&agrave; dei dati (Art. 3), limitazione di responsabilit&agrave; (Art. 6-6bis), modifiche ai termini (Art. 9) e foro competente (Art. 10)
                <span className="ml-0.5 text-error">*</span>
              </span>
            </label>
            <FieldError field="accettaClausole" />
          </div>
        </div>

        <p className="text-xs text-text-muted">
          <span className="text-error">*</span> Obbligatorio. All&apos;accettazione vengono registrati IP, data/ora, email e versione dei termini.
        </p>
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
            <h1 className="text-2xl font-light tracking-[-0.03em] text-text md:text-4xl">
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
              {visibleSteps.map((s, i) => {
                const isActive = s.num === step;
                const isCompleted = s.num < step;
                return (
                  <div
                    key={s.label}
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
                          i + 1
                        )}
                      </div>
                      {/* Connector right */}
                      {i < visibleSteps.length - 1 && (
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
                      {s.label}
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
            className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8"
          >
            {/* Step title */}
            <h2 className="mb-6 text-lg font-medium text-primary-dark">
              {step === 1 && "L'immobile"}
              {step === 2 && "Il prezzo"}
              {step === 3 && "Le foto"}
              {step === 4 && "I tuoi dati"}
              {step === 5 && "Termini e condizioni"}
            </h2>

            {/* Step content */}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}

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

              {step < 5 ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={step === 3 && photos.length < 3}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/85 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/85 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
