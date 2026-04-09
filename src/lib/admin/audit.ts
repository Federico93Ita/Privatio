import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "user.suspend"
  | "user.unsuspend"
  | "user.update"
  | "user.delete"
  | "agency.suspend"
  | "agency.unsuspend"
  | "agency.update"
  | "agency.delete"
  | "agency.approve"
  | "property.moderate.approve"
  | "property.moderate.reject"
  | "property.update"
  | "property.delete"
  | "review.hide"
  | "review.unhide"
  | "review.delete"
  | "complaint.update"
  | "complaint.assign"
  | "complaint.resolve"
  | "lead.update"
  | "export.csv";

export async function logAudit(params: {
  actorId: string;
  action: AuditAction | string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        userId: params.actorId,
        targetId: params.entityId ?? null,
        details: params.metadata
          ? ({ entity: params.entity, ...params.metadata } as object)
          : params.entity
          ? ({ entity: params.entity } as object)
          : undefined,
      },
    });
  } catch (err) {
    console.error("[audit] log failed", err);
  }
}
