import { ReactNode } from "react";

interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode; // CTA area
  align?: "center" | "left";
  variant?: "navy" | "cream";
  microcopy?: string;
}

/**
 * Editorial hero unificato per tutte le pagine pubbliche.
 * Navy mesh + tipografia display + eyebrow gold.
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  align = "center",
  variant = "navy",
  microcopy,
}: PageHeroProps) {
  const isDark = variant === "navy";
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <section
      className={`relative overflow-hidden grain ${
        isDark ? "mesh-navy" : "mesh-cream"
      } py-24 md:py-32 lg:py-40`}
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent`}
      />

      {/* Floating geometric shapes (decorative) */}
      {isDark && (
        <>
          <div className="absolute top-[15%] right-[10%] w-24 h-24 border border-[#C9A84C]/10 rounded-2xl rotate-12 animate-float hidden lg:block" />
          <div className="absolute bottom-[20%] left-[8%] w-16 h-16 border border-white/5 rounded-xl -rotate-6 animate-float-slow hidden lg:block" />
        </>
      )}

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className={alignCls}>
          {eyebrow && (
            <span
              className={`eyebrow mb-5 ${
                isDark ? "text-[#C9A84C]/80" : "text-[#0B1D3A]/60"
              }`}
            >
              {eyebrow}
            </span>
          )}
          <h1
            className={`h-display ${
              isDark ? "text-white" : "text-[#0B1D3A]"
            } animate-slide-up`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`mx-auto mt-7 max-w-2xl text-lg sm:text-xl leading-relaxed animate-slide-up ${
                isDark ? "text-white/70" : "text-[#0B1D3A]/70"
              } ${align === "center" ? "mx-auto" : "ml-0"}`}
              style={{ animationDelay: "0.15s" }}
            >
              {subtitle}
            </p>
          )}
          {children && (
            <div
              className={`mt-10 flex flex-col items-center gap-4 sm:flex-row ${
                align === "center" ? "sm:justify-center" : ""
              } animate-slide-up`}
              style={{ animationDelay: "0.3s" }}
            >
              {children}
            </div>
          )}
          {microcopy && (
            <p
              className={`mt-5 text-xs tracking-wide ${
                isDark ? "text-white/45" : "text-[#0B1D3A]/45"
              }`}
            >
              {microcopy}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
