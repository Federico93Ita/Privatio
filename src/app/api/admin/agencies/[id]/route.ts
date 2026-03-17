import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/agencies/[id] — dettaglio agenzia                   */
/* ------------------------------------------------------------------ */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { id } = await params;

  const agency = await prisma.agency.findUnique({
    where: { id },
    include: {
      agents: { select: { id: true, name: true, email: true, role: true } },
      _count: { select: { assignments: true, territories: true } },
    },
  });

  if (!agency) {
    return NextResponse.json({ error: "Agenzia non trovata" }, { status: 404 });
  }

  return NextResponse.json(agency);
}

/* ------------------------------------------------------------------ */
/*  PUT /api/admin/agencies/[id] — modifica agenzia                    */
/* ------------------------------------------------------------------ */

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.agency.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Agenzia non trovata" }, { status: 404 });
  }

  const agency = await prisma.agency.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.address !== undefined && { address: body.address }),
      ...(body.city !== undefined && { city: body.city }),
      ...(body.province !== undefined && { province: body.province }),
      ...(body.plan !== undefined && { plan: body.plan }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.coverageRadius !== undefined && { coverageRadius: body.coverageRadius }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.ragioneSociale !== undefined && { ragioneSociale: body.ragioneSociale }),
      ...(body.partitaIva !== undefined && { partitaIva: body.partitaIva }),
      ...(body.codiceFiscale !== undefined && { codiceFiscale: body.codiceFiscale }),
      ...(body.pec !== undefined && { pec: body.pec }),
      ...(body.codiceSdi !== undefined && { codiceSdi: body.codiceSdi }),
    },
  });

  return NextResponse.json(agency);
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/admin/agencies/[id] — soft delete (isActive=false)     */
/* ------------------------------------------------------------------ */

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const { id } = await params;

  const agency = await prisma.agency.findUnique({
    where: { id },
    include: {
      assignments: { where: { status: "ACTIVE" } },
    },
  });

  if (!agency) {
    return NextResponse.json({ error: "Agenzia non trovata" }, { status: 404 });
  }

  if (agency.assignments.length > 0) {
    return NextResponse.json(
      { error: "Impossibile eliminare: l'agenzia ha assegnazioni attive" },
      { status: 409 }
    );
  }

  // Soft delete
  await prisma.agency.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
