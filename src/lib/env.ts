/**
 * Environment variable validation.
 * Validates required env vars at startup to fail fast instead of at runtime.
 */

interface EnvConfig {
  /** Required in all environments */
  required: string[];
  /** Required only in production */
  production: string[];
}

const ENV_CONFIG: EnvConfig = {
  required: [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
  ],
  production: [
    "RESEND_API_KEY",
    "EMAIL_FROM",
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_GOOGLE_MAPS_KEY",
  ],
};

export function validateEnv(): { valid: boolean; missing: string[] } {
  const isProd = process.env.NODE_ENV === "production";
  const requiredVars = [
    ...ENV_CONFIG.required,
    ...(isProd ? ENV_CONFIG.production : []),
  ];

  const missing = requiredVars.filter(
    (key) => !process.env[key] || process.env[key]!.trim() === ""
  );

  if (missing.length > 0) {
    console.error(
      `[ENV] Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}`
    );
  }

  return { valid: missing.length === 0, missing };
}
