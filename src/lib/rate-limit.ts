/**
 * Rate limiter for Next.js API routes.
 *
 * Uses @upstash/ratelimit with Redis when UPSTASH_REDIS_REST_URL is configured (production).
 * Falls back to in-memory sliding window for local development.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Upstash Redis rate limiter (production)                            */
/* ------------------------------------------------------------------ */

const useRedis = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = useRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Cache Ratelimit instances per config id
const redisLimiters = new Map<string, Ratelimit>();

function getRedisLimiter(config: RateLimitConfig): Ratelimit {
  const key = `${config.id}:${config.limit}:${config.windowSeconds}`;
  let limiter = redisLimiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(
        config.limit,
        `${config.windowSeconds} s`
      ),
      prefix: `rl:${config.id}`,
    });
    redisLimiters.set(key, limiter);
  }
  return limiter;
}

/* ------------------------------------------------------------------ */
/*  In-memory rate limiter (development fallback)                      */
/* ------------------------------------------------------------------ */

interface MemoryEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryEntry>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore) {
      if (entry.resetAt < now) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

function memoryRateLimit(
  config: RateLimitConfig,
  key: string
): RateLimitResult {
  const storeKey = `${config.id}:${key}`;
  const now = Date.now();
  const entry = memoryStore.get(storeKey);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowSeconds * 1000;
    memoryStore.set(storeKey, { count: 1, resetAt });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt,
    };
  }

  if (entry.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count++;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Check rate limit for a given key (usually IP or userId).
 * Uses Upstash Redis in production, in-memory in development.
 */
export async function rateLimit(
  config: RateLimitConfig,
  key: string
): Promise<RateLimitResult> {
  if (useRedis) {
    const limiter = getRedisLimiter(config);
    const result = await limiter.limit(key);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  }
  return memoryRateLimit(config, key);
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
  register: {
    id: "register",
    limit: 3,
    windowSeconds: 600,
  } as RateLimitConfig,
  /** Lead submission: 3 requests per minute per IP */
  lead: { id: "lead", limit: 3, windowSeconds: 60 } as RateLimitConfig,
  /** OTP requests: 3 requests per 15 minutes */
  otp: { id: "otp", limit: 3, windowSeconds: 900 } as RateLimitConfig,
  /** Password reset: 3 requests per 15 minutes */
  passwordReset: {
    id: "pwd-reset",
    limit: 3,
    windowSeconds: 900,
  } as RateLimitConfig,
  /** API reads: 60 requests per minute */
  apiRead: { id: "api-read", limit: 60, windowSeconds: 60 } as RateLimitConfig,
  /** File uploads: 10 requests per minute */
  upload: { id: "upload", limit: 10, windowSeconds: 60 } as RateLimitConfig,
  /** Messages: 30 requests per minute */
  message: { id: "message", limit: 30, windowSeconds: 60 } as RateLimitConfig,
  /** Chatbot AI: 20 requests per 5 minutes per IP */
  chatbot: { id: "chatbot", limit: 20, windowSeconds: 300 } as RateLimitConfig,
} as const;

/**
 * Helper: returns a 429 response if rate limit is exceeded.
 * Usage in API routes:
 *   const limited = await applyRateLimit(RATE_LIMITS.auth, req);
 *   if (limited) return limited;
 */
export async function applyRateLimit(
  config: RateLimitConfig,
  req: Request
): Promise<Response | null> {
  const ip = getClientIp(req);
  const result = await rateLimit(config, ip);

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
