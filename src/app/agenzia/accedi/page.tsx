"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AgencyLoginPage() {
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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenziali non valide. Riprova.");
      } else {
        router.push("/dashboard/agenzia");
      }
    } catch {
      setError("Errore durante l'accesso. Riprova.");
    } finally {
      setLoading(false);
    }
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
          <p className="text-white/40 mt-2 text-sm">Area Agenzie Partner</p>
        </div>

        {/* Login card */}
        <div className="rounded-3xl bg-white/[0.95] backdrop-blur-xl border border-white/20 p-8 shadow-2xl shadow-black/20">
          <h1 className="font-heading text-2xl font-normal text-[#0B1D3A] mb-6">Accedi alla tua Dashboard</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#0B1D3A]/70 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@agenzia.it"
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

        <p className="text-center text-sm text-white/40 mt-8">
          Non hai ancora un account?{" "}
          <Link href="/agenzie" className="text-[#C9A84C] font-medium hover:text-[#D4B65E] transition-colors">
            Diventa partner
          </Link>
        </p>
      </div>
    </div>
  );
}
