import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail, savedSearchAlertEmail } from "@/lib/email";
import { generateUnsubscribeToken } from "@/app/api/unsubscribe/route";

/**
 * GET /api/cron/saved-search-alerts
 *
 * Checks saved searches with emailAlerts=true and sends notifications
 * for new properties matching the filters published since lastNotifiedAt.
 * Skips users with marketingConsent=false or emailInvalid=true.
 *
 * Runs daily via Vercel Cron.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://privatio.it";
  let notified = 0;

  try {
    // Get all saved searches with alerts enabled, only for users with marketing consent
    const searches = await prisma.savedSearch.findMany({
      where: {
        emailAlerts: true,
        user: {
          marketingConsent: true,
          emailInvalid: false,
        },
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    for (const search of searches) {
      if (!search.user.email) continue;

      const filters = search.filters as Record<string, string | number | boolean | null>;
      const since = search.lastNotifiedAt || search.createdAt;

      // Build query from saved filters
      const where: Prisma.PropertyWhereInput = {
        status: "PUBLISHED",
        publishedAt: { gt: since },
      };

      if (filters.city) where.city = { contains: String(filters.city), mode: "insensitive" };
      if (filters.type) where.type = String(filters.type) as Prisma.EnumPropertyTypeFilter;
      if (filters.minPrice || filters.maxPrice) {
        where.price = {};
        if (filters.minPrice) (where.price as Prisma.IntFilter).gte = Number(filters.minPrice);
        if (filters.maxPrice) (where.price as Prisma.IntFilter).lte = Number(filters.maxPrice);
      }
      if (filters.rooms) where.rooms = { gte: Number(filters.rooms) };

      const newProperties = await prisma.property.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: 5,
      });

      if (newProperties.length === 0) continue;

      const token = generateUnsubscribeToken(search.user.email);
      const unsubUrl = `${appUrl}/api/unsubscribe?email=${encodeURIComponent(search.user.email)}&token=${token}`;

      const template = savedSearchAlertEmail(
        search.user.name || "Utente",
        search.name,
        newProperties.length,
        `${appUrl}/dashboard/acquirente/ricerche`,
        unsubUrl
      );

      const result = await sendEmail({
        to: search.user.email,
        ...template,
      });

      if (result.success) {
        // Update lastNotifiedAt
        await prisma.savedSearch.update({
          where: { id: search.id },
          data: { lastNotifiedAt: new Date() },
        });
        notified++;
      }
    }

    return NextResponse.json({
      ok: true,
      searchesChecked: searches.length,
      notificationsSent: notified,
    });
  } catch (error) {
    console.error("Saved search alerts error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
