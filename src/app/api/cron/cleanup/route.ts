import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cron/cleanup
 *
 * Periodic cleanup of expired data:
 * - VerificationToken rows past their expiry
 * - Draft properties older than 30 days (never published)
 *
 * Protected by CRON_SECRET header so only Vercel Cron (or admin) can invoke it.
 * Configure in vercel.json:
 *   { "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 3 * * *" }] }
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [expiredTokens, staleDrafts] = await Promise.all([
    // Delete expired verification/reset tokens
    prisma.verificationToken.deleteMany({
      where: { expires: { lt: now } },
    }),
    // Delete draft properties older than 30 days that were never published
    prisma.property.deleteMany({
      where: {
        status: "DRAFT",
        createdAt: { lt: thirtyDaysAgo },
        publishedAt: null,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    cleaned: {
      expiredTokens: expiredTokens.count,
      staleDrafts: staleDrafts.count,
    },
    timestamp: now.toISOString(),
  });
}
