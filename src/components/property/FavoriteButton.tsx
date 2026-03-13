"use client";

import { useFavorite } from "@/hooks/useFavorite";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  propertyId: string;
  variant?: "icon" | "button";
  className?: string;
}

export default function FavoriteButton({
  propertyId,
  variant = "icon",
  className,
}: FavoriteButtonProps) {
  const { isFavorite, loading, toggle } = useFavorite(propertyId);

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle();
        }}
        disabled={loading}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          "bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200",
          "hover:scale-110 disabled:opacity-50",
          className
        )}
        aria-label={isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={isFavorite ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          className={cn(
            "transition-colors duration-200",
            isFavorite ? "text-error" : "text-text-muted"
          )}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    );
  }

  // "button" variant: text button for detail page
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
        "border transition-all duration-200",
        isFavorite
          ? "border-error/20 bg-error/5 text-error"
          : "border-border bg-white text-text-muted hover:text-text hover:border-primary/30",
        "disabled:opacity-50",
        className
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {isFavorite ? "Salvato" : "Salva"}
    </button>
  );
}
