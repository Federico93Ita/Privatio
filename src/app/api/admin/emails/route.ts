import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 50;

/**
 * GET /api/admin/emails
 *
 * Lista email inviate con filtri. Solo ADMIN.
 * Query params: status, to, templateName, page
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user ||
    (session.user as { role?: string }).role !== "ADMIN"
  ) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const to = searchParams.get("to");
  const templateName = searchParams.get("templateName");
  const page = parseInt(searchParams.get("page") || "1", 10);

  const where: Prisma.EmailLogWhereInput = {};
  if (status) where.status = status as Prisma.EnumEmailStatusFilter;
  if (to) where.to = { contains: to, mode: "insensitive" };
  if (templateName) where.templateName = templateName;

  const [emails, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.emailLog.count({ where }),
  ]);

  return NextResponse.json({
    emails,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}
