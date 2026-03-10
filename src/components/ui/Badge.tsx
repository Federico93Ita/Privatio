import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default: "bg-bg-soft text-text-muted border-border",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-accent/10 text-accent border-accent/20",
  error: "bg-error/10 text-error border-error/20",
  info: "bg-primary/10 text-primary border-primary/20",
} as const;

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
} as const;

export type BadgeVariant = keyof typeof variantStyles;
export type BadgeSize = keyof typeof sizeStyles;

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

function Badge({
  variant = "default",
  size = "md",
  children,
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        "whitespace-nowrap select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            variant === "default" && "bg-text-muted",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-accent",
            variant === "error" && "bg-error",
            variant === "info" && "bg-primary"
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { Badge };
