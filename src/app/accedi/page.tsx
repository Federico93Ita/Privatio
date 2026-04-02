"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getDashboardPath(role?: string): string {
  switch (role) {
    case "BUYER": return "/dashboard/acquirente";
    case "AGENCY_ADMIN":
    case "AGENCY_AGENT": return "/dashboard/agenzia";
    case "ADMIN": return "/admin";
    default: return "/dashboard/venditore";
  }
}

export default function AccediPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Email o password non validi.");
      } else {
        const session = await getSession();
        const role = (session?.user as { role?: string })?.role;
        router.push(getDashboardPath(role));
      }
    } catch {
      setError("Errore durante l'accesso.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    await signIn("google", { callbackUrl: "/dashboard/venditore" });
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
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
          <h1 className="font-heading text-2xl font-normal text-[#0B1D3A] mb-6">Accedi</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Google login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[#0B1D3A]/10 hover:bg-[#F8F6F1] transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm font-medium text-[#0B1D3A]">Continua con Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#0B1D3A]/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#0B1D3A]/40">oppure</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">Email</label>
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
              <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-[#0B1D3A]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all bg-white"
              />
            </div>
            <div className="flex justify-end">
              <Link href="/reset-password" className="text-xs text-[#C9A84C] hover:text-[#B8943B] transition-colors">
                Password dimenticata?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A] rounded-xl font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300"
            >
              {loading ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>
        </div>

        <div className="text-center mt-8 space-y-2.5">
          <p className="text-sm text-white/40">
            Non hai un account?{" "}
            <Link href="/vendi" className="text-[#C9A84C] font-medium hover:text-[#D4B65E] transition-colors">
              Vendi il tuo immobile
            </Link>
          </p>
          <p className="text-sm text-white/40">
            Cerchi casa?{" "}
            <Link href="/registrati" className="text-[#C9A84C] font-medium hover:text-[#D4B65E] transition-colors">
              Registrati come acquirente
            </Link>
          </p>
          <p className="text-sm text-white/40">
            Sei un&apos;agenzia?{" "}
            <Link href="/agenzia/accedi" className="text-[#C9A84C] font-medium hover:text-[#D4B65E] transition-colors">
              Accedi qui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
