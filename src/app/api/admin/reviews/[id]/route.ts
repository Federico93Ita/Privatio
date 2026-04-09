import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin/guard";
import { logAudit } from "@/lib/admin/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const hide = body?.hide === true;
    const reason = typeof body?.reason === "string" ? body.reason : null;

    const review = await prisma.review.update({
      where: { id },
      data: {
        isHidden: hide,
        hiddenReason: hide ? reason : null,
        hiddenAt: hide ? new Date() : null,
      },
    });
    await logAudit({
      actorId: admin.userId,
      action: hide ? "review.hide" : "review.unhide",
      entity: "Review",
      entityId: id,
      metadata: { reason },
    });
    return NextResponse.json({ review });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    await prisma.review.delete({ where: { id } });
    await logAudit({ actorId: admin.userId, action: "review.delete", entity: "Review", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
