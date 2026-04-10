/** Colori brand Privatio per email */
export const BRAND = {
  /** Header background */
  headerBg: "#0f172a",
  /** Primary blue */
  primary: "#2563eb",
  /** Success green */
  success: "#059669",
  /** Error red */
  error: "#dc2626",
  /** Warning amber */
  warning: "#d97706",
  /** Text primary */
  textPrimary: "#0f172a",
  /** Text secondary */
  textSecondary: "#475569",
  /** Text muted */
  textMuted: "#64748b",
  /** Text light */
  textLight: "#94a3b8",
  /** Background light */
  bgLight: "#f8fafc",
  /** Background accent */
  bgAccent: "#f0f9ff",
  /** Border */
  border: "#e2e8f0",
} as const;

/** URL dell'app — usare per link assoluti nelle email */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://privatio.it";

/** Font stack per email */
export const FONT_FAMILY = "Inter, Arial, sans-serif";

/** Max width per email container */
export const MAX_WIDTH = "600px";
