"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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
        <div className="w-16 h-16 bg-[#C9A84C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="font-heading text-xl font-normal text-[#0B1D3A] mb-3">Controlla la tua email</h2>
        <p className="text-[#0B1D3A]/50 mb-6">
          Se l&apos;indirizzo e registrato, riceverai un link per reimpostare la password.
        </p>
        <Link
          href="/accedi"
          className="text-sm text-[#C9A84C] hover:text-[#B8943B] transition-colors"
        >
          Torna al Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <h1 className="font-heading text-2xl font-normal text-[#0B1D3A]">Password dimenticata?</h1>
        <p className="text-[#0B1D3A]/50 mt-2 text-sm">
          Inserisci la tua email e ti invieremo un link per reimpostare la password.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@esempio.it"
          required
          className="w-full px-4 py-3 border border-[#0B1D3A]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all bg-white"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !email}
        className="w-full py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A] rounded-xl font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300"
      >
        {loading ? "Invio in corso..." : "Invia link di reset"}
      </button>
      <div className="text-center">
        <Link href="/accedi" className="text-sm text-[#C9A84C] hover:text-[#B8943B] transition-colors">
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
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-heading text-xl font-normal text-[#0B1D3A] mb-3">Password reimpostata!</h2>
        <p className="text-[#0B1D3A]/50 mb-6">Puoi ora accedere con la tua nuova password.</p>
        <Link
          href="/accedi"
          className="px-6 py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A] rounded-xl font-medium hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300 inline-block"
        >
          Accedi
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <h1 className="font-heading text-2xl font-normal text-[#0B1D3A]">Reimposta Password</h1>
        <p className="text-[#0B1D3A]/50 mt-2 text-sm">Inserisci la tua nuova password.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">
          Nuova password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimo 8 caratteri"
          required
          minLength={8}
          className="w-full px-4 py-3 border border-[#0B1D3A]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">
          Conferma password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Ripeti la password"
          required
          className="w-full px-4 py-3 border border-[#0B1D3A]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all bg-white"
        />
        {password && confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-red-600 mt-1">Le password non coincidono</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !password || password !== confirmPassword}
        className="w-full py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A] rounded-xl font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300"
      >
        {loading ? "Reimpostazione..." : "Reimposta Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={<div className="h-64 animate-pulse bg-[#0B1D3A]/5 rounded-xl" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <div className="text-center mt-8">
          <Link href="/accedi" className="text-sm text-white/40 hover:text-[#C9A84C] transition-colors">
            Torna al Login
          </Link>
        </div>
      </div>
    </div>
  );
}
