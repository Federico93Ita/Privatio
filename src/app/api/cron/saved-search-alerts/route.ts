import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail, esc } from "@/lib/email";

/**
 * GET /api/cron/saved-search-alerts
 *
 * Checks saved searches with emailAlerts=true and sends notifications
 * for new properties matching the filters published since lastNotifiedAt.
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
    // Get all saved searches with alerts enabled
    const searches = await prisma.savedSearch.findMany({
      where: { emailAlerts: true },
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
        include: { photos: { where: { isCover: true }, take: 1 } },
        orderBy: { publishedAt: "desc" },
        take: 5,
      });

      if (newProperties.length === 0) continue;

      // Build email
      const propertyHtml = newProperties
        .map(
          (p) => `
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
            ${p.photos[0] ? `<img src="${p.photos[0].url}" alt="${esc(p.title)}" style="width: 100%; height: 180px; object-fit: cover;" />` : ""}
            <div style="padding: 16px;">
              <h3 style="margin: 0; color: #0f172a; font-size: 16px;">${esc(p.title)}</h3>
              <p style="margin: 4px 0; color: #64748b; font-size: 14px;">${esc(p.city)} (${esc(p.province)})</p>
              <p style="margin: 8px 0 0; color: #2563eb; font-weight: bold; font-size: 18px;">
                ${new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(p.price)}
              </p>
              <a href="${appUrl}/immobile/${p.slug}" style="display: inline-block; margin-top: 12px; padding: 8px 16px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-size: 14px;">Vedi dettagli</a>
            </div>
          </div>`
        )
        .join("");

      await sendEmail({
        to: search.user.email,
        subject: `${newProperties.length} nuov${newProperties.length === 1 ? "o" : "i"} immobil${newProperties.length === 1 ? "e" : "i"} per "${search.name}"`,
        html: `
          <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: #0f172a; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Privatio</h1>
              <p style="color: rgba(255,255,255,0.7); margin-top: 4px; font-size: 14px;">Nuovi immobili per te</p>
            </div>
            <div style="padding: 24px; background: white;">
              <p style="color: #475569; line-height: 1.6;">
                Ciao ${esc(search.user.name || "")},<br/>
                Abbiamo trovato <strong>${newProperties.length} nuov${newProperties.length === 1 ? "o" : "i"} immobil${newProperties.length === 1 ? "e" : "i"}</strong>
                che corrispond${newProperties.length === 1 ? "e" : "ono"} alla tua ricerca salvata <strong>"${esc(search.name)}"</strong>.
              </p>
              ${propertyHtml}
              <p style="color: #94a3b8; font-size: 13px; margin-top: 20px; text-align: center;">
                <a href="${appUrl}/dashboard/acquirente/ricerche" style="color: #2563eb;">Gestisci le tue ricerche salvate</a>
                &nbsp;|&nbsp;
                Per non ricevere più queste email, disattiva gli alert dalla tua dashboard.
              </p>
            </div>
          </div>
        `,
      });

      // Update lastNotifiedAt
      await prisma.savedSearch.update({
        where: { id: search.id },
        data: { lastNotifiedAt: new Date() },
      });

      notified++;
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
