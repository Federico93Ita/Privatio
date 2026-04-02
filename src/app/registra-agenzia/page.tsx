"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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

type PageState = "loading" | "invalid" | "form" | "submitting" | "success";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function RegistraAgenziaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [pageState, setPageState] = useState<PageState>("loading");
  const [lead, setLead] = useState<LeadData | null>(null);

  /* Form fields */
  const [agencyName, setAgencyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accettaTermini, setAccettaTermini] = useState(false);
  const [accettaPrivacy, setAccettaPrivacy] = useState(false);
  const [accettaContratto, setAccettaContratto] = useState(false);
  const [error, setError] = useState("");

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

  /* ---- Submit ---- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

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
          approvalToken: token,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Errore durante la registrazione.");
      }

      // Auto-login
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        // Registration succeeded but auto-login failed
        setPageState("success");
      } else {
        router.push("/dashboard/agenzia?welcome=true");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante la registrazione.");
      setPageState("form");
    }
  }

  /* ---- Input class ---- */
  const inputClass =
    "w-full px-4 py-3 border border-[#0B1D3A]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all bg-white";

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
              Il tuo account agenzia è stato creato con successo. Accedi per iniziare.
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

  /* ---- Registration form ---- */
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

        <div className="rounded-3xl bg-white/[0.95] backdrop-blur-xl border border-white/20 p-8 shadow-2xl shadow-black/20">
          {/* Welcome banner */}
          <div className="mb-6 rounded-2xl bg-[#C9A84C]/[0.08] border border-[#C9A84C]/15 p-4">
            <p className="text-sm text-[#C9A84C] font-medium">
              La tua candidatura è stata approvata!
            </p>
            <p className="text-xs text-[#0B1D3A]/50 mt-1">
              Completa la registrazione per attivare il tuo account {lead?.agencyName}.
            </p>
          </div>

          <h1 className="font-heading text-2xl font-normal text-[#0B1D3A] mb-6">Completa la registrazione</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Contact name + Email (pre-filled, read-only for email) */}
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
                  onChange={(e) => setProvince(e.target.value)}
                  required
                  maxLength={2}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Description (optional) */}
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

            {/* Divider */}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={pageState === "submitting" || !accettaTermini || !accettaPrivacy || !accettaContratto}
              className="w-full py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A] rounded-xl font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {pageState === "submitting" && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {pageState === "submitting" ? "Registrazione in corso..." : "Completa Registrazione"}
            </button>
          </form>
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
