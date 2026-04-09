import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin/guard";
import { logAudit } from "@/lib/admin/audit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = typeof body?.reason === "string" ? body.reason : null;
    const ban = body?.ban === true;

    const user = await prisma.user.update({
      where: { id },
      data: {
        status: ban ? "BANNED" : "SUSPENDED",
        suspendedAt: new Date(),
        suspendedReason: reason,
        suspendedBy: admin.userId,
      },
      select: { id: true, email: true, status: true, suspendedAt: true, suspendedReason: true },
    });

    await logAudit({
      actorId: admin.userId,
      action: "user.suspend",
      entity: "User",
      entityId: id,
      metadata: { reason, ban },
    });

    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("user.suspend error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
