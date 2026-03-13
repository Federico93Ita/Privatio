"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export function useFavorite(propertyId: string) {
  const { status } = useSession();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = status === "authenticated";

  // Check initial favorite state
  useEffect(() => {
    if (!isAuthenticated || !propertyId) return;

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`/api/favorites?propertyId=${propertyId}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setIsFavorite(data.isFavorite);
        }
      } catch {
        // silently fail
      }
    }

    check();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, propertyId]);

  const toggle = useCallback(async () => {
    if (!isAuthenticated) {
      // Redirect to login with callback
      window.location.href = `/accedi?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        const res = await fetch(`/api/favorites?propertyId=${propertyId}`, {
          method: "DELETE",
        });
        if (res.ok) setIsFavorite(false);
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId }),
        });
        if (res.ok || res.status === 409) setIsFavorite(true);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isFavorite, propertyId]);

  return { isFavorite, loading, toggle, isAuthenticated };
}
