import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin/guard";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "hidden" | "visible" | null
    const where: { isHidden?: boolean } = {};
    if (filter === "hidden") where.isHidden = true;
    if (filter === "visible") where.isHidden = false;

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { id: true, name: true, email: true } },
        agency: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ reviews });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
