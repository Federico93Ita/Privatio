import { prisma } from "@/lib/prisma";

/**
 * Log an auditable action. Fire-and-forget — never blocks the caller.
 */
export function auditLog(params: {
  action: string;
  userId?: string | null;
  targetId?: string | null;
  details?: Record<string, unknown>;
  ip?: string | null;
}) {
  prisma.auditLog
    .create({
      data: {
        action: params.action,
        userId: params.userId ?? undefined,
        targetId: params.targetId ?? undefined,
        details: params.details ? JSON.parse(JSON.stringify(params.details)) : undefined,
        ip: params.ip ?? undefined,
      },
    })
    .catch((err) => {
      console.error("Audit log write failed:", err);
    });
}
