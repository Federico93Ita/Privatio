import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin/guard";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const where: { status?: "RECEIVED" | "IN_REVIEW" | "RESOLVED" | "CLOSED" } = {};
    if (status === "RECEIVED" || status === "IN_REVIEW" || status === "RESOLVED" || status === "CLOSED") {
      where.status = status;
    }
    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ complaints });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
