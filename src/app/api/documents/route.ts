import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

// GET /api/documents?propertyId=xxx
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    if (!propertyId) {
      return NextResponse.json({ error: "propertyId richiesto" }, { status: 400 });
    }

    // Verify user has access
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        sellerId: true,
        assignment: { select: { agency: { select: { agents: { select: { id: true } } } } } },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Immobile non trovato" }, { status: 404 });
    }

    const isSeller = property.sellerId === session.user.id;
    const agentIds = property.assignment?.agency?.agents?.map((a: any) => a.id) || [];
    const isAgent = agentIds.includes(session.user.id);
    const isAdmin = (session.user as any).role === "ADMIN";

    if (!isSeller && !isAgent && !isAdmin) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const documents = await prisma.document.findMany({
      where: { propertyId },
      include: {
        uploader: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Documents GET error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

// POST /api/documents — upload a document (multipart)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const propertyId = formData.get("propertyId") as string | null;
    const category = (formData.get("category") as string) || "ALTRO";

    if (!file || !propertyId) {
      return NextResponse.json({ error: "File e propertyId richiesti" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File troppo grande (max 20MB)" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tipo file non supportato. Usa PDF, JPEG, PNG o WebP." }, { status: 400 });
    }

    // Verify access
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        sellerId: true,
        assignment: { select: { agency: { select: { agents: { select: { id: true } } } } } },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Immobile non trovato" }, { status: 404 });
    }

    const isSeller = property.sellerId === session.user.id;
    const agentIds = property.assignment?.agency?.agents?.map((a: any) => a.id) || [];
    const isAgent = agentIds.includes(session.user.id);

    if (!isSeller && !isAgent) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    // Upload to Supabase Storage
    const supabaseAdmin = getSupabaseAdmin();
    const fileExt = file.name.split(".").pop() || "pdf";
    const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("property-documents")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: "Errore nel caricamento" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("property-documents")
      .getPublicUrl(fileName);

    const document = await prisma.document.create({
      data: {
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        mimeType: file.type,
        category,
        propertyId,
        uploaderId: session.user.id,
      },
      include: {
        uploader: { select: { name: true } },
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

// DELETE /api/documents?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("id");
    if (!docId) {
      return NextResponse.json({ error: "ID documento richiesto" }, { status: 400 });
    }

    const document = await prisma.document.findUnique({
      where: { id: docId },
    });

    if (!document) {
      return NextResponse.json({ error: "Documento non trovato" }, { status: 404 });
    }

    // Only the uploader can delete
    if (document.uploaderId !== session.user.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    // Delete from Supabase
    const supabaseAdmin = getSupabaseAdmin();
    const urlParts = document.url.split("/property-documents/");
    if (urlParts[1]) {
      await supabaseAdmin.storage
        .from("property-documents")
        .remove([urlParts[1]]);
    }

    await prisma.document.delete({ where: { id: docId } });

    return NextResponse.json({ message: "Documento eliminato" });
  } catch (error) {
    console.error("Document delete error:", error);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
