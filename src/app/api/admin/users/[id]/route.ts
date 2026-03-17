import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  PUT /api/admin/users/[id] — modifica utente                        */
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

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  // Prevent demoting the last admin
  if (existing.role === "ADMIN" && body.role && body.role !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Impossibile: è l'ultimo amministratore" },
        { status: 409 }
      );
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.role !== undefined && { role: body.role }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/admin/users/[id] — elimina utente                      */
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
  const adminId = (session.user as any).id;

  // Prevent self-deletion
  if (id === adminId) {
    return NextResponse.json(
      { error: "Non puoi eliminare il tuo stesso account" },
      { status: 409 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { properties: true } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  // Prevent deleting last admin
  if (existing.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Impossibile eliminare l'ultimo amministratore" },
        { status: 409 }
      );
    }
  }

  // Block if user has properties
  if (existing._count.properties > 0) {
    return NextResponse.json(
      { error: "L'utente ha immobili associati. Eliminali prima di procedere." },
      { status: 409 }
    );
  }

  // Delete user and related records
  await prisma.$transaction([
    prisma.message.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } }),
    prisma.favorite.deleteMany({ where: { userId: id } }),
    prisma.savedSearch.deleteMany({ where: { userId: id } }),
    prisma.review.deleteMany({ where: { userId: id } }),
    prisma.session.deleteMany({ where: { userId: id } }),
    prisma.account.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
