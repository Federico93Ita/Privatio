import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAuthError } from "@/lib/admin/guard";
import { logAudit } from "@/lib/admin/audit";

const ALLOWED = ["users", "agencies", "properties", "leads", "complaints"] as const;
type Entity = (typeof ALLOWED)[number];

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = v instanceof Date ? v.toISOString() : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map((h) => csvEscape(r[h])).join(","));
  return lines.join("\n");
}

export async function GET(_req: Request, { params }: { params: Promise<{ entity: string }> }) {
  try {
    const admin = await requireAdmin();
    const { entity } = await params;
    if (!ALLOWED.includes(entity as Entity)) {
      return NextResponse.json({ error: "Entity non supportata" }, { status: 400 });
    }

    let rows: Record<string, unknown>[] = [];
    switch (entity as Entity) {
      case "users":
        rows = await prisma.user.findMany({
          select: { id: true, email: true, name: true, phone: true, role: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        });
        break;
      case "agencies":
        rows = await prisma.agency.findMany({
          select: { id: true, name: true, email: true, phone: true, city: true, province: true, plan: true, isActive: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        });
        break;
      case "properties":
        rows = await prisma.property.findMany({
          select: { id: true, slug: true, title: true, status: true, price: true, city: true, province: true, sellerId: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        });
        break;
      case "leads": {
        const seller = await prisma.sellerLead.findMany({ orderBy: { createdAt: "desc" } });
        rows = seller.map((l) => ({ kind: "seller", ...l }));
        break;
      }
      case "complaints":
        rows = await prisma.complaint.findMany({ orderBy: { createdAt: "desc" } });
        break;
    }

    await logAudit({ actorId: admin.userId, action: "export.csv", entity, metadata: { count: rows.length } });

    const csv = toCsv(rows as Record<string, unknown>[]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${entity}-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("export error", err);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
