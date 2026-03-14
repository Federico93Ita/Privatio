"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AgencyReviews from "@/components/AgencyReviews";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AssignmentInfo {
  agencyId: string;
  agencyName: string;
  propertyTitle: string;
  status: string;
}

/* ------------------------------------------------------------------ */
/*  Star Rating Input                                                  */
/* ------------------------------------------------------------------ */

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`${star} stell${star === 1 ? "a" : "e"}`}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill={(hover || value) >= star ? "#f59e0b" : "none"}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
      <span className="ml-2 text-sm text-text-muted">
        {value > 0 ? `${value}/5` : "Seleziona"}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function ReviewPage() {
  const [assignment, setAssignment] = useState<AssignmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAssignment() {
      try {
        // Fetch seller dashboard data to get agency assignment info
        const res = await fetch("/api/dashboard/seller");
        if (res.ok) {
          const data = await res.json();
          if (data.agency && data.property) {
            setAssignment({
              agencyId: data.agency.id || "",
              agencyName: data.agency.name || "Agenzia",
              propertyTitle: data.property.title || "Il tuo immobile",
              status: data.property.currentStage || "",
            });
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchAssignment();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Seleziona un punteggio.");
      return;
    }
    if (!assignment?.agencyId) {
      setError("Nessuna agenzia da recensire.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId: assignment.agencyId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Errore nell'invio della recensione");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout role="seller">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-light tracking-[-0.03em] text-primary-dark sm:text-3xl">
            Recensione Agenzia
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Condividi la tua esperienza con l&apos;agenzia che ha gestito la vendita.
          </p>
        </div>

        {loading && (
          <div className="animate-pulse rounded-xl border border-border bg-white p-6">
            <div className="h-6 w-1/3 rounded bg-border/50 mb-4" />
            <div className="h-4 w-2/3 rounded bg-border/50" />
          </div>
        )}

        {!loading && !assignment && (
          <div className="rounded-xl border border-border bg-white p-6 text-center">
            <p className="text-sm text-text-muted">
              Non hai ancora un&apos;agenzia partner o la vendita non è ancora completata.
            </p>
          </div>
        )}

        {!loading && assignment && !success && (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-5"
          >
            <div>
              <p className="text-sm text-text-muted mb-1">Agenzia</p>
              <p className="text-lg font-semibold text-text">{assignment.agencyName}</p>
              <p className="text-xs text-text-muted">Per: {assignment.propertyTitle}</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Valutazione
              </label>
              <StarInput value={rating} onChange={setRating} />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Commento (opzionale)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Racconta la tua esperienza..."
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-transparent resize-none"
              />
              <p className="text-xs text-text-muted mt-1 text-right">
                {comment.length}/2000
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Invio in corso..." : "Invia Recensione"}
            </button>
          </form>
        )}

        {success && (
          <div className="rounded-xl border border-success/30 bg-success/5 p-6 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="mx-auto mb-3" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h3 className="text-lg font-semibold text-text mb-1">Grazie per la tua recensione!</h3>
            <p className="text-sm text-text-muted">
              La tua opinione aiuta altri venditori a scegliere l&apos;agenzia giusta.
            </p>
          </div>
        )}

        {/* Show existing reviews for this agency */}
        {assignment?.agencyId && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-primary-dark mb-4">
              Recensioni per {assignment.agencyName}
            </h2>
            <AgencyReviews agencyId={assignment.agencyId} agencyName={assignment.agencyName} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
