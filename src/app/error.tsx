"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-light tracking-[-0.03em] text-text mb-3">
          Qualcosa è andato storto
        </h1>
        <p className="text-text-muted mb-8">
          Si è verificato un errore imprevisto. Prova a ricaricare la pagina.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/85 transition-colors"
          >
            Riprova
          </button>
          <a
            href="/"
            className="px-6 py-2.5 border border-border text-text rounded-lg font-medium hover:bg-bg-soft transition-colors"
          >
            Torna alla Home
          </a>
        </div>
      </div>
    </div>
  );
}
