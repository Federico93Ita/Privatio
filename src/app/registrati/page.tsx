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
    <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-xl font-semibold tracking-[-0.03em] text-primary-dark">Privatio</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          <h1 className="text-2xl font-medium text-text mb-2">Registrati</h1>
          <p className="text-sm text-text-muted mb-6">
            Crea il tuo account acquirente per salvare preferiti, ricerche e contattare i venditori.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/15 rounded-lg text-sm text-error">
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
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-transparent"
              />
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
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-transparent"
              />
            </div>

            {/* Checkbox consensi */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accettaTermini}
                  onChange={(e) => setAccettaTermini(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
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
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
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
              className="w-full py-3 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/85 transition-colors"
            >
              {loading ? "Registrazione in corso..." : "Crea Account"}
            </button>
          </form>

          <p className="text-xs text-text-muted mt-4 text-center">
            <span className="text-error">*</span> Obbligatorio
          </p>
        </div>

        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-text-muted">
            Hai gi&agrave; un account?{" "}
            <Link href="/accedi" className="text-primary font-medium hover:underline">
              Accedi
            </Link>
          </p>
          <p className="text-sm text-text-muted">
            Vuoi vendere?{" "}
            <Link href="/vendi" className="text-primary font-medium hover:underline">
              Inserisci il tuo immobile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
