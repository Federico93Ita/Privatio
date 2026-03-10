"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Errore");
      }
    } catch {
      setError("Errore di connessione. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-[#0e8ff1]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#0e8ff1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#0a1f44] mb-3">Controlla la tua email</h2>
        <p className="text-[#64748b] mb-6">
          Se l&apos;indirizzo e registrato, riceverai un link per reimpostare la password.
        </p>
        <Link
          href="/accedi"
          className="text-sm text-[#0e8ff1] hover:underline"
        >
          Torna al Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-heading text-[#0a1f44]">Password dimenticata?</h1>
        <p className="text-[#64748b] mt-2">
          Inserisci la tua email e ti invieremo un link per reimpostare la password.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1e293b] mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@esempio.it"
          required
          className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e8ff1]"
        />
      </div>
      {error && <p className="text-sm text-[#ef4444]">{error}</p>}
      <button
        type="submit"
        disabled={loading || !email}
        className="w-full py-2.5 bg-[#0e8ff1] text-white rounded-lg font-medium disabled:opacity-50 hover:bg-[#0a1f44] transition-colors"
      >
        {loading ? "Invio in corso..." : "Invia link di reset"}
      </button>
      <div className="text-center">
        <Link href="/accedi" className="text-sm text-[#0e8ff1] hover:underline">
          Torna al Login
        </Link>
      </div>
    </form>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }
    if (password.length < 8) {
      setError("La password deve avere almeno 8 caratteri");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email: emailParam, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Errore nel reset della password");
      }
    } catch {
      setError("Errore di connessione. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  // No token = show forgot password form
  if (!token || !emailParam) {
    return <ForgotPasswordForm />;
  }

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#0a1f44] mb-3">Password reimpostata!</h2>
        <p className="text-[#64748b] mb-6">Puoi ora accedere con la tua nuova password.</p>
        <Link
          href="/accedi"
          className="px-6 py-2.5 bg-[#0e8ff1] text-white rounded-lg font-medium hover:bg-[#0a1f44] transition-colors inline-block"
        >
          Accedi
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-heading text-[#0a1f44]">Reimposta Password</h1>
        <p className="text-[#64748b] mt-2">Inserisci la tua nuova password.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1e293b] mb-1">
          Nuova password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimo 8 caratteri"
          required
          minLength={8}
          className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e8ff1]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#1e293b] mb-1">
          Conferma password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Ripeti la password"
          required
          className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e8ff1]"
        />
        {password && confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-[#ef4444] mt-1">Le password non coincidono</p>
        )}
      </div>

      {error && <p className="text-sm text-[#ef4444]">{error}</p>}

      <button
        type="submit"
        disabled={loading || !password || password !== confirmPassword}
        className="w-full py-2.5 bg-[#0e8ff1] text-white rounded-lg font-medium disabled:opacity-50 hover:bg-[#0a1f44] transition-colors"
      >
        {loading ? "Reimpostazione..." : "Reimposta Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f8fafc] pt-32 pb-16 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl p-8 border border-[#e2e8f0] shadow-sm">
          <Suspense fallback={<div className="h-64 animate-pulse bg-[#f8fafc] rounded-lg" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
