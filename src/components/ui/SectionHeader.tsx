import { ReactNode } from "react";
import ScrollReveal from "./ScrollReveal";

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  variant?: "navy" | "cream";
  align?: "center" | "left";
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  variant = "cream",
  align = "center",
}: SectionHeaderProps) {
  const isDark = variant === "navy";

  return (
    <ScrollReveal>
      <div className={`mb-14 md:mb-16 ${align === "center" ? "text-center" : ""}`}>
        {eyebrow && (
          <span
            className={`eyebrow mb-4 ${
              isDark ? "text-[#C9A84C]/70" : "text-[#C9A84C]"
            }`}
          >
            {eyebrow}
          </span>
        )}
        <h2
          className={`h-section ${
            isDark ? "text-white" : "text-[#0B1D3A]"
          }`}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={`mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg ${
              isDark ? "text-white/60" : "text-[#0B1D3A]/60"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </ScrollReveal>
  );
}
