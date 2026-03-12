import { type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const paddingStyles = {
  none: "p-0",
  sm: "p-5",
  md: "p-6",
  lg: "p-8",
} as const;

export type CardPadding = keyof typeof paddingStyles;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: CardPadding;
  hover?: boolean;
  bordered?: boolean;
}

function Card({
  children,
  padding = "md",
  hover = false,
  bordered = true,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-bg",
        bordered && "border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        paddingStyles[padding],
        hover &&
          "transition-all duration-300 ease-out hover:shadow-md hover:shadow-black/5 hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("flex items-center justify-between pb-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: "h2" | "h3" | "h4";
}

function CardTitle({
  children,
  as: Tag = "h3",
  className,
  ...props
}: CardTitleProps) {
  return (
    <Tag
      className={cn("text-lg font-medium text-text tracking-[-0.02em]", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between pt-4 border-t border-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
