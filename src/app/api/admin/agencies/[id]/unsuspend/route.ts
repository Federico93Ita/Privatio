import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin/guard";
import { logAudit } from "@/lib/admin/audit";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const agency = await prisma.agency.update({
      where: { id },
      data: { status: "ACTIVE", suspendedAt: null, suspendedReason: null, suspendedBy: null, isActive: true },
      select: { id: true, name: true, status: true },
    });
    await logAudit({ actorId: admin.userId, action: "agency.unsuspend", entity: "Agency", entityId: id });
    return NextResponse.json({ agency });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("agency.unsuspend error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
