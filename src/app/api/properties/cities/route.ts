import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/properties/cities — Returns distinct cities with published properties.
 * Used for search autocomplete.
 */
export async function GET() {
  try {
    const results = await prisma.property.findMany({
      where: { status: "PUBLISHED" },
      select: { city: true, province: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    });

    const cities = results.map((r) => ({
      city: r.city,
      province: r.province,
      label: `${r.city} (${r.province})`,
    }));

    return NextResponse.json({ cities });
  } catch {
    return NextResponse.json({ cities: [] });
  }
}
