import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin/guard";
import { logAudit } from "@/lib/admin/audit";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const user = await prisma.user.update({
      where: { id },
      data: { status: "ACTIVE", suspendedAt: null, suspendedReason: null, suspendedBy: null },
      select: { id: true, email: true, status: true },
    });
    await logAudit({ actorId: admin.userId, action: "user.unsuspend", entity: "User", entityId: id });
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("user.unsuspend error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
