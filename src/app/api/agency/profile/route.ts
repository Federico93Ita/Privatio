import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const urlOptional = z.string().url().max(500).optional().nullable().or(z.literal(""));

const profileSchema = z.object({
  tagline: z.string().max(160).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  logoUrl: urlOptional,
  coverImageUrl: urlOptional,
  videoUrl: urlOptional,
  foundedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional().nullable(),
  teamSize: z.number().int().min(1).max(10000).optional().nullable(),
  responseTimeHours: z.number().int().min(1).max(168).optional().nullable(),
  transactionsCount: z.number().int().min(0).max(100000).optional().nullable(),
  specializations: z.array(z.string().max(60)).max(20).optional(),
  languages: z.array(z.string().max(40)).max(15).optional(),
  serviceAreas: z.array(z.string().max(80)).max(30).optional(),
  gallery: z.array(z.string().url().max(500)).max(20).optional(),
  certifications: z.array(z.string().max(120)).max(20).optional(),
  awards: z.array(z.string().max(120)).max(20).optional(),
  uniqueSellingPoints: z.array(z.string().max(160)).max(10).optional(),
  website: urlOptional,
  instagramUrl: urlOptional,
  facebookUrl: urlOptional,
  linkedinUrl: urlOptional,
  whatsappNumber: z.string().max(30).optional().nullable(),
});

// Minimum required for "complete" profile
function isProfileComplete(data: Record<string, unknown>): boolean {
  const tagline = (data.tagline as string | null) || "";
  const description = (data.description as string | null) || "";
  const usp = (data.uniqueSellingPoints as string[] | null) || [];
  const spec = (data.specializations as string[] | null) || [];
  return (
    tagline.trim().length >= 10 &&
    description.trim().length >= 80 &&
    usp.length >= 3 &&
    spec.length >= 1
  );
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { agency: true },
  });
  if (!user || !user.agencyId || (user.role !== "AGENCY_ADMIN" && user.role !== "AGENCY_AGENT")) {
    return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 403 });
  }
  return NextResponse.json({ agency: user.agency });
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user || !user.agencyId || user.role !== "AGENCY_ADMIN") {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Normalize empty strings to null for url fields
    const data: Record<string, unknown> = { ...parsed.data };
    for (const k of [
      "logoUrl",
      "coverImageUrl",
      "videoUrl",
      "website",
      "instagramUrl",
      "facebookUrl",
      "linkedinUrl",
    ]) {
      if (data[k] === "") data[k] = null;
    }

    // Merge with existing for completeness check
    const existing = await prisma.agency.findUnique({ where: { id: user.agencyId } });
    const merged = { ...existing, ...data };
    if (isProfileComplete(merged) && !existing?.profileCompletedAt) {
      data.profileCompletedAt = new Date();
    }

    const updated = await prisma.agency.update({
      where: { id: user.agencyId },
      data,
    });

    return NextResponse.json({ success: true, agency: updated });
  } catch (error) {
    console.error("Update agency profile error:", error);
    return NextResponse.json({ error: "Errore aggiornamento profilo" }, { status: 500 });
  }
}
