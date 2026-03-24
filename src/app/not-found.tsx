import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-6xl font-light tracking-[-0.03em] text-text mb-2">404</h1>
        <h2 className="text-xl font-medium text-text mb-3">
          Pagina non trovata
        </h2>
        <p className="text-text-muted mb-8">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/85 transition-colors"
          >
            Torna alla Home
          </Link>
          <Link
            href="/cerca"
            className="px-6 py-2.5 border border-border text-text rounded-lg font-medium hover:bg-bg-soft transition-colors"
          >
            Cerca Immobili
          </Link>
        </div>
      </div>
    </div>
  );
}
