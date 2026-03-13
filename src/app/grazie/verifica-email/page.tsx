"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted">Verifica in corso...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-primary-dark mb-3">Email verificata!</h2>
        <p className="text-text-muted mb-6">
          Il tuo indirizzo email e stato verificato con successo.
        </p>
        <Link
          href="/accedi"
          className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/85 transition-colors inline-block"
        >
          Accedi al tuo account
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-xl font-medium text-primary-dark mb-3">Verifica non riuscita</h2>
      <p className="text-text-muted mb-6">{errorMsg}</p>
      <Link
        href="/accedi"
        className="text-sm text-primary hover:underline"
      >
        Torna al Login
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-soft pt-32 pb-16 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl p-8 border border-border shadow-sm">
          <Suspense fallback={<div className="h-64 animate-pulse bg-bg-soft rounded-lg" />}>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
