"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegistratiPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accettaTermini, setAccettaTermini] = useState(false);
  const [accettaPrivacy, setAccettaPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!accettaTermini) {
      setError("Devi accettare i Termini e Condizioni del Servizio.");
      return;
    }
    if (!accettaPrivacy) {
      setError("Devi accettare l'Informativa sulla Privacy.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Le password non corrispondono.");
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

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role: "BUYER", accettaTermini, accettaPrivacy }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Errore durante la registrazione.");
        return;
      }

      // Auto-login after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Registration succeeded but auto-login failed — redirect to login
        router.push("/accedi");
      } else {
        router.push("/dashboard/acquirente");
      }
    } catch {
      setError("Errore durante la registrazione.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0B1D3A]" />
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C9A84C]/[0.05] blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#C9A84C]/[0.03] blur-[80px]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-semibold tracking-[-0.03em] bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] bg-clip-text text-transparent">Privatio</span>
          </Link>
        </div>

        <div className="rounded-3xl bg-white/[0.95] backdrop-blur-xl border border-white/20 p-8 shadow-2xl shadow-black/20">
          <h1 className="font-heading text-2xl font-normal text-[#0B1D3A] mb-2">Registrati</h1>
          <p className="text-sm text-[#0B1D3A]/50 mb-6">
            Crea il tuo account acquirente per salvare preferiti, ricerche e contattare i venditori.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Nome e Cognome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Mario Rossi"
                className="w-full px-4 py-3 border border-[#0B1D3A]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@esempio.it"
                className="w-full px-4 py-3 border border-[#0B1D3A]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Telefono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+39 333 1234567"
                className="w-full px-4 py-3 border border-[#0B1D3A]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 8 caratteri, 1 maiuscola, 1 numero, 1 speciale"
                className="w-full px-4 py-3 border border-[#0B1D3A]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all bg-white"
              />
              {/* Real-time password validation */}
              {password.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {[
                    { ok: password.length >= 8, label: "8+ caratteri" },
                    { ok: /[A-Z]/.test(password), label: "1 maiuscola" },
                    { ok: /[0-9]/.test(password), label: "1 numero" },
                    { ok: /[^A-Za-z0-9]/.test(password), label: "1 speciale" },
                  ].map((rule) => (
                    <span key={rule.label} className={`flex items-center gap-1 text-xs ${rule.ok ? "text-success" : "text-text-muted"}`}>
                      {rule.ok ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      )}
                      {rule.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Conferma Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Ripeti la password"
                className="w-full px-4 py-3 border border-[#0B1D3A]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all bg-white"
              />
            </div>

            {/* Checkbox consensi */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accettaTermini}
                  onChange={(e) => setAccettaTermini(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#0B1D3A]/20 text-[#C9A84C] accent-[#C9A84C] focus:ring-[#C9A84C]/30"
                />
                <span className="text-sm text-text">
                  Ho letto e accetto i{" "}
                  <Link href="/termini-di-servizio" className="text-primary underline font-medium" target="_blank">
                    Termini e Condizioni del Servizio
                  </Link>
                  <span className="ml-0.5 text-error">*</span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accettaPrivacy}
                  onChange={(e) => setAccettaPrivacy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#0B1D3A]/20 text-[#C9A84C] accent-[#C9A84C] focus:ring-[#C9A84C]/30"
                />
                <span className="text-sm text-text">
                  Ho letto e accetto l&apos;
                  <Link href="/privacy-policy" className="text-primary underline font-medium" target="_blank">
                    Informativa sulla Privacy
                  </Link>
                  <span className="ml-0.5 text-error">*</span>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A] rounded-xl font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300"
            >
              {loading ? "Registrazione in corso..." : "Crea Account"}
            </button>
          </form>

          <p className="text-xs text-text-muted mt-4 text-center">
            <span className="text-error">*</span> Obbligatorio
          </p>
        </div>

        <div className="text-center mt-8 space-y-2.5">
          <p className="text-sm text-white/40">
            Hai gi&agrave; un account?{" "}
            <Link href="/accedi" className="text-[#C9A84C] font-medium hover:text-[#D4B65E] transition-colors">
              Accedi
            </Link>
          </p>
          <p className="text-sm text-white/40">
            Vuoi vendere?{" "}
            <Link href="/vendi" className="text-[#C9A84C] font-medium hover:text-[#D4B65E] transition-colors">
              Inserisci il tuo immobile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
