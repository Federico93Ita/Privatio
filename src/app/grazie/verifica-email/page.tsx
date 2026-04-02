"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setErrorMsg("Link non valido.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token!)}&email=${encodeURIComponent(email!)}`
        );
        if (res.ok) {
          setStatus("success");
        } else {
          const data = await res.json();
          setStatus("error");
          setErrorMsg(data.error || "Errore nella verifica.");
        }
      } catch {
        setStatus("error");
        setErrorMsg("Errore di connessione. Riprova.");
      }
    }

    verify();
  }, [token, email]);

  if (status === "loading") {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#0B1D3A]/50">Verifica in corso...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-heading text-xl font-normal text-[#0B1D3A] mb-3">Email verificata!</h2>
        <p className="text-[#0B1D3A]/50 mb-6">
          Il tuo indirizzo email è stato verificato con successo.
        </p>
        <Link
          href="/accedi"
          className="px-6 py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A] rounded-xl font-medium hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300 inline-block"
        >
          Accedi al tuo account
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="font-heading text-xl font-normal text-[#0B1D3A] mb-3">Verifica non riuscita</h2>
      <p className="text-[#0B1D3A]/50 mb-6">{errorMsg}</p>
      <Link
        href="/accedi"
        className="text-sm text-[#C9A84C] hover:text-[#B8943B] transition-colors"
      >
        Torna al Login
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
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
        </div>

        <div className="rounded-3xl bg-white/[0.95] backdrop-blur-xl border border-white/20 p-8 shadow-2xl shadow-black/20">
          <Suspense fallback={<div className="h-64 animate-pulse bg-[#0B1D3A]/5 rounded-xl" />}>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
