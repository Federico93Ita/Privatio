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
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0e8ff1] to-[#0a1f44] flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-[#0a1f44]">Privatio</span>
          </Link>
          <p className="text-[#64748b] mt-2">Area Agenzie Partner</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-8">
          <h1 className="text-2xl font-bold text-[#0a1f44] mb-6">Accedi alla tua Dashboard</h1>

          {error && (
            <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg text-sm text-[#ef4444]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@agenzia.it"
                className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e8ff1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e8ff1] focus:border-transparent"
              />
            </div>
            <div className="flex justify-end">
              <Link href="/reset-password" className="text-xs text-[#0e8ff1] hover:underline">
                Password dimenticata?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0e8ff1] text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-[#0a1f44] transition-colors"
            >
              {loading ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#64748b] mt-6">
          Non hai ancora un account?{" "}
          <Link href="/agenzie" className="text-[#0e8ff1] font-medium hover:underline">
            Diventa partner
          </Link>
        </p>
      </div>
    </div>
  );
}
