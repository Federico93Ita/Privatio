import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin/guard";
import { logAudit } from "@/lib/admin/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const data: {
      status?: "RECEIVED" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
      assignedToId?: string | null;
      resolutionNote?: string | null;
      resolvedAt?: Date | null;
    } = {};

    if (body?.status && ["RECEIVED", "IN_REVIEW", "RESOLVED", "CLOSED"].includes(body.status)) {
      data.status = body.status;
      if (body.status === "RESOLVED" || body.status === "CLOSED") data.resolvedAt = new Date();
    }
    if (body?.assignedToId !== undefined) data.assignedToId = body.assignedToId || null;
    if (body?.resolutionNote !== undefined) data.resolutionNote = body.resolutionNote || null;

    const complaint = await prisma.complaint.update({ where: { id }, data });

    await logAudit({
      actorId: admin.userId,
      action: "complaint.update",
      entity: "Complaint",
      entityId: id,
      metadata: data as Record<string, unknown>,
    });

    return NextResponse.json({ complaint });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("complaint.update error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
