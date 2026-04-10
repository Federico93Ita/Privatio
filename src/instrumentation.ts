import { validateEnv } from "@/lib/env";

export function register() {
  const { valid, missing } = validateEnv();
  if (!valid) {
    console.error(
      `[STARTUP] Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}`
    );
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Cannot start in production with missing env vars: ${missing.join(", ")}`
      );
    }
  }
}
