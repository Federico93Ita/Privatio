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

    // L'admin non pubblica: approva (l'immobile resta DRAFT, sara l'agenzia a pubblicare)
    // oppure rifiuta (WITHDRAWN)
    const updateData: Record<string, unknown> = {
      moderationNote: note,
      moderatedAt: new Date(),
      moderatedBy: admin.userId,
    };

    if (decision === "REJECT") {
      updateData.status = "WITHDRAWN";
    }
    // APPROVE: lo status resta invariato — l'admin conferma che l'immobile è conforme
    // L'agenzia assegnata gestirà le transizioni DRAFT → PENDING_REVIEW → PUBLISHED

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
      select: { id: true, slug: true, status: true, moderationNote: true, moderatedAt: true },
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
