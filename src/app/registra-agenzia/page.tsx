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
    "w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-colors";

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  /* Loading */
  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-text-muted text-sm">Verifica del token in corso...</p>
        </div>
      </div>
    );
  }

  /* Invalid token */
  if (pageState === "invalid") {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <svg className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-medium text-text">Link non valido</h1>
            <p className="mt-2 text-text-muted">
              Questo link di registrazione non è valido, è scaduto o è già stato utilizzato.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href="/agenzie"
              className="block w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/85 transition-colors text-center"
            >
              Richiedi una nuova candidatura
            </Link>
            <Link
              href="/agenzia/accedi"
              className="block text-sm text-primary hover:underline"
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
      <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-medium text-text">Registrazione completata!</h1>
            <p className="mt-2 text-text-muted">
              Il tuo account agenzia è stato creato con successo. Accedi per iniziare.
            </p>
          </div>
          <Link
            href="/agenzia/accedi"
            className="block w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/85 transition-colors text-center"
          >
            Accedi alla Dashboard
          </Link>
        </div>
      </div>
    );
  }

  /* ---- Registration form ---- */
  return (
    <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-xl font-semibold tracking-[-0.03em] text-primary-dark">Privatio</span>
          </Link>
          <p className="text-text-muted mt-1 text-sm">Area Agenzie Partner</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          {/* Welcome banner */}
          <div className="mb-6 rounded-xl bg-success/5 border border-success/15 p-4">
            <p className="text-sm text-success font-medium">
              La tua candidatura è stata approvata!
            </p>
            <p className="text-xs text-text-muted mt-1">
              Completa la registrazione per attivare il tuo account {lead?.agencyName}.
            </p>
          </div>

          <h1 className="text-2xl font-medium text-text mb-6">Completa la registrazione</h1>

          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/15 rounded-lg text-sm text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Agency name */}
            <div>
              <label className="block text-sm font-medium text-text mb-1">Nome Agenzia</label>
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
                <label className="block text-sm font-medium text-text mb-1">Referente</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className={`${inputClass} bg-bg-soft text-text-muted cursor-not-allowed`}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-text mb-1">Telefono</label>
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
              <label className="block text-sm font-medium text-text mb-1">
                Indirizzo sede <span className="text-error">*</span>
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
                <label className="block text-sm font-medium text-text mb-1">Città</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Provincia</label>
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
              <label className="block text-sm font-medium text-text mb-1">
                Descrizione agenzia <span className="text-text-muted font-normal">(opzionale)</span>
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
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-text-muted">Credenziali di accesso</span>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-text mb-1">Password</label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
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
              <label className="block text-sm font-medium text-text mb-1">Conferma Password</label>
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
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                />
                <span className="text-sm text-text">
                  Ho letto e accetto i{" "}
                  <Link href="/termini-di-servizio" target="_blank" className="text-primary hover:underline">
                    Termini di Servizio
                  </Link>{" "}
                  <span className="text-error">*</span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accettaPrivacy}
                  onChange={(e) => setAccettaPrivacy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                />
                <span className="text-sm text-text">
                  Ho letto e accetto l&apos;
                  <Link href="/privacy-policy" target="_blank" className="text-primary hover:underline">
                    Informativa sulla Privacy
                  </Link>{" "}
                  <span className="text-error">*</span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accettaContratto}
                  onChange={(e) => setAccettaContratto(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                />
                <span className="text-sm text-text">
                  Ho letto e accetto il{" "}
                  <Link href="/contratto-agenzia" target="_blank" className="text-primary hover:underline">
                    Contratto di Convenzionamento
                  </Link>{" "}
                  <span className="text-error">*</span>
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={pageState === "submitting" || !accettaTermini || !accettaPrivacy || !accettaContratto}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/85 transition-colors flex items-center justify-center gap-2"
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

        <p className="text-center text-sm text-text-muted mt-6">
          Hai già un account?{" "}
          <Link href="/agenzia/accedi" className="text-primary font-medium hover:underline">
            Accedi qui
          </Link>
        </p>
      </div>
    </div>
  );
}
