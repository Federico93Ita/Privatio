import { cn } from "@/lib/utils";

export type SkeletonVariant = "text" | "circle" | "rect";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  lines?: number;
}

function Skeleton({
  variant = "text",
  width,
  height,
  className,
  lines = 1,
}: SkeletonProps) {
  const baseClass = "animate-pulse bg-border rounded";

  if (variant === "circle") {
    const size = width || height || 40;
    return (
      <div
        className={cn(baseClass, "rounded-full shrink-0", className)}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  if (variant === "rect") {
    return (
      <div
        className={cn(baseClass, "rounded-lg", className)}
        style={{
          width: width || "100%",
          height: height || 120,
        }}
        aria-hidden="true"
      />
    );
  }

  /* variant === "text" */
  if (lines > 1) {
    return (
      <div className="flex flex-col gap-2" aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClass, "h-4 rounded", className)}
            style={{
              width:
                i === lines - 1 ? "75%" : width || "100%",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClass, "h-4 rounded", className)}
      style={{ width: width || "100%", height: height }}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Convenience presets                                                 */
/* ------------------------------------------------------------------ */

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border p-6 space-y-4",
        className
      )}
      aria-hidden="true"
    >
      <Skeleton variant="rect" height={180} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" lines={2} />
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" width={32} />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  );
}

function SkeletonTable({
  rows = 5,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              variant="text"
              className="flex-1"
              height={16}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable };
