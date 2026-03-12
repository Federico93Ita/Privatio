import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
  colorMode?: "auto" | "primary" | "accent";
}

function getAutoColor(percentage: number): string {
  if (percentage >= 80) return "bg-success";
  if (percentage >= 50) return "bg-primary";
  if (percentage >= 25) return "bg-accent";
  return "bg-error";
}

const sizeMap = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
} as const;

const colorModeMap = {
  primary: "bg-primary",
  accent: "bg-accent",
} as const;

function ProgressBar({
  value,
  max = 100,
  size = "md",
  showLabel = false,
  label,
  className,
  colorMode = "auto",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const roundedPercentage = Math.round(percentage);

  const barColor =
    colorMode === "auto" ? getAutoColor(percentage) : colorModeMap[colorMode];

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm font-medium text-text">{label}</span>
          )}
          {showLabel && (
            <span className="text-sm tabular-nums text-text-muted">
              {roundedPercentage}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full bg-border overflow-hidden",
          sizeMap[size]
        )}
        role="progressbar"
        aria-valuenow={roundedPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || `${roundedPercentage}% completato`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            barColor
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export { ProgressBar };
