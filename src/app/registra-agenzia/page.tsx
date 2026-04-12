"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { validatePartitaIva, validatePec } from "@/lib/validators";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LeadData {
  agencyName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  province: string;
}

interface NearbyZone {
  id: string;
  name: string;
  slug: string;
  zoneClass: string;
  municipalities: string[];
  price: number;
  slots: { taken: number; max: number };
  isHome: boolean;
}

type PageState = "loading" | "invalid" | "form" | "loading-zones" | "submitting" | "success";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function RegistraAgenziaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [pageState, setPageState] = useState<PageState>("loading");
  const [lead, setLead] = useState<LeadData | null>(null);

  /* Wizard step */
  const [step, setStep] = useState<1 | 2>(1);

  /* Form fields */
  const [agencyName, setAgencyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [description, setDescription] = useState("");
  const [partitaIva, setPartitaIva] = useState("");
  const [pec, setPec] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accettaTermini, setAccettaTermini] = useState(false);
  const [accettaPrivacy, setAccettaPrivacy] = useState(false);
  const [accettaContratto, setAccettaContratto] = useState(false);
  const [error, setError] = useState("");

  /* Zone selection */
  const [nearbyZones, setNearbyZones] = useState<NearbyZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  /* Zone preview (Step 1, debounced) */
  const [previewZones, setPreviewZones] = useState<NearbyZone[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  /* ---- Validate token on mount ---- */
  useEffect(() => {
    if (!token) {
      setPageState("invalid");
      return;
    }

    async function validate() {
      try {
        const res = await fetch(`/api/agency/validate-token?token=${encodeURIComponent(token)}`);
        if (!res.ok) {
          setPageState("invalid");
          return;
        }
        const data = await res.json();
        const ld = data.lead as LeadData;
        setLead(ld);
        setAgencyName(ld.agencyName);
        setName(ld.contactName);
        setEmail(ld.email);
        setPhone(ld.phone);
        setCity(ld.city);
        setProvince(ld.province);
        setPageState("form");
      } catch {
        setPageState("invalid");
      }
    }

    validate();
  }, [token]);

  /* ---- Debounced zone preview when city+province are filled ---- */
  useEffect(() => {
    if (city.length < 2 || province.length !== 2) {
      setPreviewZones([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingPreview(true);
      try {
        const res = await fetch(
          `/api/zones/nearby?city=${encodeURIComponent(city)}&province=${encodeURIComponent(province)}`
        );
        const data = await res.json();
        setPreviewZones(data.zones || []);
      } catch {
        setPreviewZones([]);
      } finally {
        setLoadingPreview(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [city, province]);

  /* ---- Step 1: Validate and load zones ---- */
  async function handleStep1Continue() {
    setError("");

    // Validazione dati fiscali
    if (!partitaIva.trim()) {
      setError("La Partita IVA è obbligatoria.");
      return;
    }
    if (!validatePartitaIva(partitaIva)) {
      setError("Partita IVA non valida. Deve essere di 11 cifre con checksum corretto.");
      return;
    }
    if (!pec.trim()) {
      setError("L'indirizzo PEC è obbligatorio.");
      return;
    }
    if (!validatePec(pec)) {
      setError("Indirizzo PEC non valido.");
      return;
    }

    if (password.length < 8) {
      setError("La password deve avere almeno 8 caratteri.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("La password deve contenere almeno una lettera maiuscola.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("La password deve contenere almeno un numero.");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("La password deve contenere almeno un carattere speciale.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Le password non corrispondono.");
      return;
    }
    if (!address.trim()) {
      setError("L'indirizzo della sede è obbligatorio.");
      return;
    }
    if (!accettaTermini || !accettaPrivacy || !accettaContratto) {
      setError("Devi accettare tutti i consensi per continuare.");
      return;
    }

    // Reuse preview zones if already loaded, otherwise fetch
    if (previewZones.length > 0) {
      setNearbyZones(previewZones);
      const homeZone = previewZones.find((z) => z.isHome);
      if (homeZone && homeZone.slots.taken < homeZone.slots.max) {
        setSelectedZoneId(homeZone.id);
      }
      setStep(2);
      return;
    }

    setPageState("loading-zones");
    try {
      const res = await fetch(`/api/zones/nearby?city=${encodeURIComponent(city)}&province=${encodeURIComponent(province)}`);
      const data = await res.json();

      if (!data.zones || data.zones.length === 0) {
        setError("Nessun territorio disponibile nella tua zona. Contattaci a info@privatio.it per assistenza.");
        setPageState("form");
        return;
      }

      setNearbyZones(data.zones);
      const homeZone = data.zones.find((z: NearbyZone) => z.isHome);
      if (homeZone && homeZone.slots.taken < homeZone.slots.max) {
        setSelectedZoneId(homeZone.id);
      }
      setStep(2);
      setPageState("form");
    } catch {
      setError("Errore nel caricamento dei territori. Riprova.");
      setPageState("form");
    }
  }

  /* ---- Step 2: Submit registration ---- */
  async function handleSubmit() {
    setError("");

    if (!selectedZoneId) {
      setError("Seleziona un territorio per continuare.");
      return;
    }

    setPageState("submitting");

    try {
      const res = await fetch("/api/agency/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName,
          name,
          email,
          phone,
          password,
          address,
          city,
          province,
          description: description || undefined,
          partitaIva: partitaIva.trim(),
          pec: pec.trim().toLowerCase(),
          approvalToken: token,
          selectedZoneId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Errore durante la registrazione.");
      }

      const regData = await res.json();

      // Auto-login
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        // Registration succeeded but auto-login failed
        setPageState("success");
        return;
      }

      // Redirect to Stripe checkout for the selected zone
      try {
        const checkoutRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ zoneId: regData.selectedZoneId }),
        });

        if (checkoutRes.ok) {
          const checkoutData = await checkoutRes.json();
          if (checkoutData.url) {
            window.location.href = checkoutData.url;
            return;
          }
        }
      } catch {
        // Checkout failed, redirect to dashboard instead
      }

      // Fallback: go to dashboard
      router.push("/dashboard/agenzia/territori?welcome=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante la registrazione.");
      setPageState("form");
    }
  }

  /* ---- Input class ---- */
  const inputClass =
    "w-full px-4 py-3 border border-[#0B1D3A]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all bg-white";

  /* ---- Zone class badge colors ---- */
  const classColors: Record<string, string> = {
    BASE: "bg-blue-100 text-blue-700",
    URBANA: "bg-purple-100 text-purple-700",
    PREMIUM: "bg-amber-100 text-amber-700",
  };

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  /* Loading */
  if (pageState === "loading") {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#0B1D3A]" />
        <div className="relative text-center space-y-4">
          <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/40 text-sm">Verifica del token in corso...</p>
        </div>
      </div>
    );
  }

  /* Loading zones */
  if (pageState === "loading-zones") {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#0B1D3A]" />
        <div className="relative text-center space-y-4">
          <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/40 text-sm">Ricerca territori disponibili nella tua zona...</p>
        </div>
      </div>
    );
  }

  /* Invalid token */
  if (pageState === "invalid") {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[#0B1D3A]" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C9A84C]/[0.05] blur-[120px]" />

        <div className="relative w-full max-w-md text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h1 className="font-heading text-2xl font-normal text-white">Link non valido</h1>
            <p className="mt-2 text-white/40">
              Questo link di registrazione non è valido, è scaduto o è già stato utilizzato.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href="/agenzie"
              className="block w-full py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A] rounded-xl font-medium hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300 text-center"
            >
              Richiedi una nuova candidatura
            </Link>
            <Link
              href="/agenzia/accedi"
              className="block text-sm text-[#C9A84C] hover:text-[#D4B65E] transition-colors"
            >
              Hai già un account? Accedi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* Success (fallback if auto-login fails) */
  if (pageState === "success") {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[#0B1D3A]" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C9A84C]/[0.05] blur-[120px]" />

        <div className="relative w-full max-w-md text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h1 className="font-heading text-2xl font-normal text-white">Registrazione completata!</h1>
            <p className="mt-2 text-white/40">
              Il tuo account agenzia è stato creato con successo. Accedi per completare l&apos;abbonamento.
            </p>
          </div>
          <Link
            href="/agenzia/accedi"
            className="block w-full py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A] rounded-xl font-medium hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300 text-center"
          >
            Accedi alla Dashboard
          </Link>
        </div>
      </div>
    );
  }

  /* ---- Registration form (Step 1 & 2) ---- */
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0B1D3A]" />
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C9A84C]/[0.05] blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#C9A84C]/[0.03] blur-[80px]" />

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-semibold tracking-[-0.03em] bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] bg-clip-text text-transparent">Privatio</span>
          </Link>
          <p className="text-white/40 mt-1 text-sm">Area Agenzie Partner</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`flex items-center gap-2 ${step === 1 ? "text-[#C9A84C]" : "text-white/30"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 1 ? "bg-[#C9A84C] text-[#0B1D3A]" : "bg-white/10 text-white/50"}`}>
              {step > 1 ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : "1"}
            </div>
            <span className="text-sm">Dati agenzia</span>
          </div>
          <div className="w-8 h-px bg-white/20" />
          <div className={`flex items-center gap-2 ${step === 2 ? "text-[#C9A84C]" : "text-white/30"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 2 ? "bg-[#C9A84C] text-[#0B1D3A]" : "bg-white/10 text-white/50"}`}>
              2
            </div>
            <span className="text-sm">Scegli territorio</span>
          </div>
        </div>

        <div className="rounded-3xl bg-white/[0.95] backdrop-blur-xl border border-white/20 p-8 shadow-2xl shadow-black/20">
          {/* Welcome banner */}
          <div className="mb-6 rounded-2xl bg-[#C9A84C]/[0.08] border border-[#C9A84C]/15 p-4">
            <p className="text-sm text-[#C9A84C] font-medium">
              La tua candidatura è stata approvata!
            </p>
            <p className="text-xs text-[#0B1D3A]/50 mt-1">
              {step === 1
                ? `Completa la registrazione per attivare il tuo account ${lead?.agencyName}.`
                : "Scegli il territorio dove vuoi operare. Potrai aggiungerne altri dalla dashboard (max 3)."}
            </p>
          </div>

          <h1 className="font-heading text-2xl font-normal text-[#0B1D3A] mb-6">
            {step === 1 ? "Completa la registrazione" : "Scegli il tuo territorio"}
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ======================== STEP 1 ======================== */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); handleStep1Continue(); }} className="space-y-5">
              {/* Agency name */}
              <div>
                <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">Nome Agenzia</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              {/* Contact name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">Referente</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className={`${inputClass} bg-[#F8F6F1] text-[#0B1D3A]/40 cursor-not-allowed`}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">Telefono</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">
                  Indirizzo sede <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Via Roma 1"
                  className={inputClass}
                />
              </div>

              {/* City + Province */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">Città</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">Provincia</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value.toUpperCase())}
                    required
                    maxLength={2}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Zone preview */}
              {(previewZones.length > 0 || loadingPreview) && (
                <div className="p-3 rounded-xl bg-[#F8F6F1] border border-[#C9A84C]/10">
                  <p className="text-xs font-medium text-[#0B1D3A]/50 mb-2">
                    Territori disponibili nella tua zona:
                  </p>
                  {loadingPreview ? (
                    <div className="flex items-center gap-2 text-xs text-[#0B1D3A]/30">
                      <div className="w-3 h-3 border border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                      Ricerca...
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {previewZones.slice(0, 5).map((z) => (
                        <div key={z.id} className="flex items-center justify-between text-xs">
                          <span className="text-[#0B1D3A]/70">{z.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            z.zoneClass === "PREMIUM" ? "bg-amber-100 text-amber-800" :
                            z.zoneClass === "URBANA" ? "bg-blue-100 text-blue-800" :
                            "bg-green-100 text-green-800"
                          }`}>
                            {z.zoneClass}
                          </span>
                        </div>
                      ))}
                      {previewZones.length > 5 && (
                        <p className="text-[10px] text-[#0B1D3A]/30 pt-1">
                          +{previewZones.length - 5} altri territori disponibili
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">
                  Descrizione agenzia <span className="text-[#0B1D3A]/30 font-normal">(opzionale)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Breve presentazione della vostra agenzia..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Divider — Dati fiscali */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#C9A84C]/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-[#0B1D3A]/40">Dati fiscali</span>
                </div>
              </div>

              {/* P.IVA */}
              <div>
                <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">
                  Partita IVA <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={partitaIva}
                    onChange={(e) => setPartitaIva(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder="12345678901"
                    maxLength={11}
                    className={inputClass}
                  />
                  {partitaIva.length === 11 && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${validatePartitaIva(partitaIva) ? "text-green-500" : "text-red-400"}`}>
                      {validatePartitaIva(partitaIva) ? "✓" : "✗"}
                    </span>
                  )}
                </div>
              </div>

              {/* PEC */}
              <div>
                <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">
                  PEC (Posta Elettronica Certificata) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={pec}
                    onChange={(e) => setPec(e.target.value)}
                    placeholder="agenzia@pec.it"
                    className={inputClass}
                  />
                  {pec.length > 5 && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${validatePec(pec) ? "text-green-500" : "text-red-400"}`}>
                      {validatePec(pec) ? "✓" : "✗"}
                    </span>
                  )}
                </div>
              </div>

              {/* Divider — Credenziali */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#C9A84C]/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-[#0B1D3A]/40">Credenziali di accesso</span>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Minimo 8 caratteri"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0B1D3A]/30 hover:text-[#0B1D3A]/60 transition-colors"
                    aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">Conferma Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Ripeti la password"
                  className={inputClass}
                />
              </div>

              {/* Consensi GDPR */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accettaTermini}
                    onChange={(e) => setAccettaTermini(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#0B1D3A]/20 text-[#C9A84C] accent-[#C9A84C] focus:ring-[#C9A84C]/30"
                  />
                  <span className="text-sm text-[#0B1D3A]/70">
                    Ho letto e accetto i{" "}
                    <Link href="/termini-di-servizio" target="_blank" className="text-[#C9A84C] underline font-medium">
                      Termini di Servizio
                    </Link>{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accettaPrivacy}
                    onChange={(e) => setAccettaPrivacy(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#0B1D3A]/20 text-[#C9A84C] accent-[#C9A84C] focus:ring-[#C9A84C]/30"
                  />
                  <span className="text-sm text-[#0B1D3A]/70">
                    Ho letto e accetto l&apos;
                    <Link href="/privacy-policy" target="_blank" className="text-[#C9A84C] underline font-medium">
                      Informativa sulla Privacy
                    </Link>{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accettaContratto}
                    onChange={(e) => setAccettaContratto(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#0B1D3A]/20 text-[#C9A84C] accent-[#C9A84C] focus:ring-[#C9A84C]/30"
                  />
                  <span className="text-sm text-[#0B1D3A]/70">
                    Ho letto e accetto il{" "}
                    <Link href="/contratto-agenzia" target="_blank" className="text-[#C9A84C] underline font-medium">
                      Contratto di Convenzionamento
                    </Link>{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              {/* Continue to Step 2 */}
              <button
                type="submit"
                disabled={!accettaTermini || !accettaPrivacy || !accettaContratto}
                className="w-full py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A] rounded-xl font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Continua — Scegli Territorio
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>
          )}

          {/* ======================== STEP 2 ======================== */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-[#0B1D3A]/60">
                In base alla sede di <strong>{city} ({province})</strong>, ecco i territori disponibili nella tua zona.
                I primi 90 giorni sono gratuiti.
              </p>

              {/* Zone cards */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {nearbyZones.map((zone) => {
                  const isFull = zone.slots.taken >= zone.slots.max;
                  const isSelected = selectedZoneId === zone.id;

                  return (
                    <button
                      key={zone.id}
                      type="button"
                      disabled={isFull}
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-[#C9A84C] bg-[#C9A84C]/[0.05] shadow-md"
                          : isFull
                          ? "border-[#0B1D3A]/5 bg-gray-50 opacity-50 cursor-not-allowed"
                          : "border-[#0B1D3A]/10 bg-white hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/[0.02]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-[#0B1D3A]">{zone.name}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${classColors[zone.zoneClass] || "bg-gray-100 text-gray-600"}`}>
                              {zone.zoneClass}
                            </span>
                            {zone.isHome && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                La tua zona
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#0B1D3A]/40 mt-1 truncate">
                            {zone.municipalities.slice(0, 5).join(", ")}
                            {zone.municipalities.length > 5 && ` +${zone.municipalities.length - 5}`}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-semibold text-[#0B1D3A]">
                            {(zone.price / 100).toFixed(0)}<span className="text-xs font-normal text-[#0B1D3A]/40">/mese</span>
                          </div>
                          <div className={`text-xs mt-0.5 ${isFull ? "text-red-500" : "text-[#0B1D3A]/40"}`}>
                            {isFull ? "Completo" : `${zone.slots.taken}/${zone.slots.max} agenzie`}
                          </div>
                        </div>
                      </div>

                      {/* Selection indicator */}
                      <div className="mt-3 flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? "border-[#C9A84C] bg-[#C9A84C]" : "border-[#0B1D3A]/20"
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs text-[#0B1D3A]/50">
                          {isSelected ? "Selezionato" : isFull ? "Non disponibile" : "Seleziona questo territorio"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Trial info */}
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-emerald-700">
                    <strong>90 giorni gratuiti</strong> — il primo addebito avverrà dopo il periodo di prova.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(""); }}
                  className="px-6 py-3.5 border border-[#0B1D3A]/10 text-[#0B1D3A]/70 rounded-xl font-medium hover:bg-[#0B1D3A]/5 transition-all"
                >
                  Indietro
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedZoneId || pageState === "submitting"}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A] rounded-xl font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {pageState === "submitting" && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {pageState === "submitting" ? "Registrazione in corso..." : "Completa Registrazione"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-white/40 mt-8">
          Hai già un account?{" "}
          <Link href="/agenzia/accedi" className="text-[#C9A84C] font-medium hover:text-[#D4B65E] transition-colors">
            Accedi qui
          </Link>
        </p>
      </div>
    </div>
  );
}
