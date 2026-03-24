/**
 * In-memory rate limiter for Next.js API routes.
 * Uses a sliding window counter approach.
 *
 * ⚠️  PRODUCTION TODO: Replace with @upstash/ratelimit for serverless deployments.
 *     In-memory stores are per-instance and do NOT share state across Vercel functions.
 *     Install: npm i @upstash/ratelimit @upstash/redis
 *     Then configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars.
 *     See: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  /** Unique identifier for this limiter (e.g., "auth", "lead", "otp") */
  id: string;
  /** Maximum number of requests in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key (usually IP or userId).
 * Returns { success: true } if under limit, { success: false } if exceeded.
 */
export function rateLimit(
  config: RateLimitConfig,
  key: string
): RateLimitResult {
  const storeKey = `${config.id}:${key}`;
  const now = Date.now();
  const entry = store.get(storeKey);

  if (!entry || entry.resetAt < now) {
    // First request or window expired
    const resetAt = now + config.windowSeconds * 1000;
    store.set(storeKey, { count: 1, resetAt });
    return { success: true, limit: config.limit, remaining: config.limit - 1, resetAt };
  }

  if (entry.count >= config.limit) {
    return { success: false, limit: config.limit, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Extract client IP from request headers.
 * Works with Vercel, Cloudflare, and standard proxies.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

/** Pre-configured rate limit configs */
export const RATE_LIMITS = {
  /** Auth endpoints: 5 requests per minute */
  auth: { id: "auth", limit: 5, windowSeconds: 60 } as RateLimitConfig,
  /** Registration: 3 requests per 10 minutes */
  register: { id: "register", limit: 3, windowSeconds: 600 } as RateLimitConfig,
  /** Lead submission: 3 requests per minute per IP */
  lead: { id: "lead", limit: 3, windowSeconds: 60 } as RateLimitConfig,
  /** OTP requests: 3 requests per 15 minutes */
  otp: { id: "otp", limit: 3, windowSeconds: 900 } as RateLimitConfig,
  /** Password reset: 3 requests per 15 minutes */
  passwordReset: { id: "pwd-reset", limit: 3, windowSeconds: 900 } as RateLimitConfig,
  /** API reads: 60 requests per minute */
  apiRead: { id: "api-read", limit: 60, windowSeconds: 60 } as RateLimitConfig,
  /** File uploads: 10 requests per minute */
  upload: { id: "upload", limit: 10, windowSeconds: 60 } as RateLimitConfig,
  /** Messages: 30 requests per minute */
  message: { id: "message", limit: 30, windowSeconds: 60 } as RateLimitConfig,
} as const;

/**
 * Helper: returns a 429 response if rate limit is exceeded.
 * Usage in API routes:
 *   const limited = applyRateLimit(RATE_LIMITS.auth, req);
 *   if (limited) return limited;
 */
export function applyRateLimit(
  config: RateLimitConfig,
  req: Request
): Response | null {
  const ip = getClientIp(req);
  const result = rateLimit(config, ip);

  if (!result.success) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    return new Response(
      JSON.stringify({
        error: "Troppe richieste. Riprova tra poco.",
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        },
      }
    );
  }

  return null;
}
