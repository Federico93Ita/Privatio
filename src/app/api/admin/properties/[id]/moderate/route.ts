import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin/guard";
import { logAudit } from "@/lib/admin/audit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const decision = body?.decision as "APPROVE" | "REJECT";
    const note = typeof body?.note === "string" ? body.note : null;

    if (decision !== "APPROVE" && decision !== "REJECT") {
      return NextResponse.json({ error: "Decisione non valida" }, { status: 400 });
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
        status: decision === "APPROVE" ? "PUBLISHED" : "WITHDRAWN",
        publishedAt: decision === "APPROVE" ? new Date() : null,
        moderationNote: note,
        moderatedAt: new Date(),
        moderatedBy: admin.userId,
      },
      select: { id: true, slug: true, status: true, moderationNote: true },
    });

    await logAudit({
      actorId: admin.userId,
      action: decision === "APPROVE" ? "property.moderate.approve" : "property.moderate.reject",
      entity: "Property",
      entityId: id,
      metadata: { note },
    });

    return NextResponse.json({ property });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("property.moderate error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
