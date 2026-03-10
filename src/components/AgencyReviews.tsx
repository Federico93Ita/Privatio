"use client";

import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string };
}

interface AgencyReviewsProps {
  agencyId: string;
  agencyName?: string;
}

/* ------------------------------------------------------------------ */
/*  Star Component                                                     */
/* ------------------------------------------------------------------ */

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} filled={i < rating} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AgencyReviews({ agencyId, agencyName }: AgencyReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?agencyId=${agencyId}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    if (agencyId) fetchReviews();
  }, [agencyId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-border p-4">
            <div className="h-4 w-1/4 rounded bg-border/50 mb-2" />
            <div className="h-3 w-3/4 rounded bg-border/50" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 text-center">
        <p className="text-sm text-text-muted">
          {agencyName
            ? `Nessuna recensione per ${agencyName} ancora.`
            : "Nessuna recensione disponibile."}
        </p>
      </div>
    );
  }

  // Calculate average
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-5">
        <div className="text-center">
          <p className="text-3xl font-bold text-[#0a1f44]">{avgRating.toFixed(1)}</p>
          <StarRating rating={Math.round(avgRating)} />
          <p className="text-xs text-text-muted mt-1">
            {reviews.length} recension{reviews.length === 1 ? "e" : "i"}
          </p>
        </div>
        <div className="flex-1">
          {/* Distribution bars */}
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const pct = (count / reviews.length) * 100;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right text-text-muted">{star}</span>
                <div className="flex-1 h-2 rounded-full bg-[#f1f5f9]">
                  <div
                    className="h-2 rounded-full bg-[#f59e0b]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right text-text-muted">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-xl border border-border bg-white p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {review.user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium text-text">{review.user.name}</p>
                  <p className="text-[10px] text-text-muted">
                    {new Date(review.createdAt).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>
            {review.comment && (
              <p className="text-sm text-text-muted mt-2">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
