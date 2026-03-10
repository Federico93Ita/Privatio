import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { propertySchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/properties — Public listing with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const city = searchParams.get("city");
    const type = searchParams.get("type");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minSurface = searchParams.get("minSurface");
    const maxSurface = searchParams.get("maxSurface");
    const rooms = searchParams.get("rooms");
    const hasGarage = searchParams.get("hasGarage");
    const hasGarden = searchParams.get("hasGarden");
    const hasBalcony = searchParams.get("hasBalcony");
    const hasElevator = searchParams.get("hasElevator");
    const sort = searchParams.get("sort") || "newest";

    const where: Prisma.PropertyWhereInput = {
      status: "PUBLISHED",
    };

    if (city) where.city = { contains: city, mode: "insensitive" };
    if (type) where.type = type as Prisma.EnumPropertyTypeFilter;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Prisma.IntFilter).gte = parseInt(minPrice);
      if (maxPrice) (where.price as Prisma.IntFilter).lte = parseInt(maxPrice);
    }
    if (minSurface || maxSurface) {
      where.surface = {};
      if (minSurface) (where.surface as Prisma.IntFilter).gte = parseInt(minSurface);
      if (maxSurface) (where.surface as Prisma.IntFilter).lte = parseInt(maxSurface);
    }
    if (rooms) where.rooms = { gte: parseInt(rooms) };
    if (hasGarage === "true") where.hasGarage = true;
    if (hasGarden === "true") where.hasGarden = true;
    if (hasBalcony === "true") where.hasBalcony = true;
    if (hasElevator === "true") where.hasElevator = true;

    const orderByMap: Record<string, Prisma.PropertyOrderByWithRelationInput> = {
      newest: { publishedAt: "desc" },
      price_asc: { price: "asc" },
      price_desc: { price: "desc" },
      surface_desc: { surface: "desc" },
    };
    const orderBy = orderByMap[sort] ?? orderByMap.newest;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          photos: {
            orderBy: { order: "asc" },
            take: 1,
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Properties list error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento immobili" },
      { status: 500 }
    );
  }
}

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PHOTOS = 20;

// Geocode an address using Google Maps Geocoding API
async function geocodeAddress(
  address: string,
  city: string,
  province: string
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!apiKey) return null;

  const query = encodeURIComponent(`${address}, ${city}, ${province}, Italia`);
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${apiKey}`
  );
  const data = await res.json();

  if (data.status === "OK" && data.results?.[0]?.geometry?.location) {
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  }
  return null;
}

// POST /api/properties — Create property (authenticated seller)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    const formData = await req.formData();

    // Extract photo files
    const photoFiles = formData.getAll("foto") as File[];
    const coverIndexStr = formData.get("coverIndex") as string | null;
    const coverIndex = coverIndexStr ? parseInt(coverIndexStr, 10) : 0;

    // Validate photos
    if (photoFiles.length > MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Massimo ${MAX_PHOTOS} foto consentite` },
        { status: 400 }
      );
    }

    for (const file of photoFiles) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Formato non supportato: ${file.name}. Usa JPEG, PNG o WebP.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File troppo grande: ${file.name}. Massimo 10MB per foto.` },
          { status: 400 }
        );
      }
    }

    // Map Italian form field names to English schema names
    const caratteristiche = JSON.parse(
      (formData.get("caratteristiche") as string) || "[]"
    ) as string[];

    const address = formData.get("indirizzo") as string;
    const city = formData.get("citta") as string;
    const province = (formData.get("provincia") as string)?.toUpperCase();

    // Geocode address
    const coords = await geocodeAddress(address, city, province);
    if (!coords) {
      return NextResponse.json(
        { error: "Impossibile determinare le coordinate dell'indirizzo. Verifica l'indirizzo inserito." },
        { status: 400 }
      );
    }

    const propertyData = {
      type: formData.get("tipoImmobile") as string,
      address,
      city,
      province,
      cap: formData.get("cap") as string,
      surface: parseInt(formData.get("superficie") as string, 10),
      rooms: parseInt(formData.get("locali") as string, 10),
      bathrooms: parseInt(formData.get("bagni") as string, 10),
      floor: formData.get("piano")
        ? parseInt(formData.get("piano") as string, 10)
        : undefined,
      totalFloors: formData.get("totalePiani")
        ? parseInt(formData.get("totalePiani") as string, 10)
        : undefined,
      hasGarage: caratteristiche.includes("Garage / Posto auto"),
      hasGarden: caratteristiche.includes("Giardino"),
      hasBalcony: caratteristiche.includes("Balcone / Terrazzo"),
      hasElevator: caratteristiche.includes("Ascensore"),
      energyClass: (formData.get("classeEnergetica") as string) || undefined,
      yearBuilt: formData.get("annoCostruzione")
        ? parseInt(formData.get("annoCostruzione") as string, 10)
        : undefined,
      price: parseInt(formData.get("prezzo") as string, 10),
      description: (formData.get("descrizione") as string) || undefined,
      lat: coords.lat,
      lng: coords.lng,
      title: "", // Will be generated below
    };

    // Generate title
    const typeLabel =
      propertyData.type.charAt(0) +
      propertyData.type.slice(1).toLowerCase().replace(/_/g, " ");
    propertyData.title = `${typeLabel} ${propertyData.rooms} locali — ${propertyData.city}`;

    // Validate with Zod schema
    const parsed = propertySchema.safeParse(propertyData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Create property in a transaction
    const property = await prisma.$transaction(async (tx) => {
      const created = await tx.property.create({
        data: {
          ...data,
          title: propertyData.title,
          slug: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sellerId: session.user.id,
          status: "DRAFT",
        },
      });

      const finalSlug = generateSlug(
        data.type,
        data.rooms,
        data.city,
        created.id
      );

      return tx.property.update({
        where: { id: created.id },
        data: { slug: finalSlug },
      });
    });

    // Upload photos to Supabase Storage
    if (photoFiles.length > 0) {
      const supabase = getSupabaseAdmin();
      const photoRecords: {
        url: string;
        order: number;
        isCover: boolean;
        propertyId: string;
      }[] = [];

      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        const ext = file.name.split(".").pop() || "jpg";
        const filePath = `properties/${property.id}/${i}-${Date.now()}.${ext}`;

        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await supabase.storage
          .from("property-photos")
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error(`Upload error for ${file.name}:`, uploadError);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("property-photos").getPublicUrl(filePath);

        photoRecords.push({
          url: publicUrl,
          order: i,
          isCover: i === coverIndex,
          propertyId: property.id,
        });
      }

      if (photoRecords.length > 0) {
        await prisma.propertyPhoto.createMany({ data: photoRecords });
      }
    }

    return NextResponse.json(
      { property: { id: property.id, slug: property.slug } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Property creation error:", error);
    return NextResponse.json(
      { error: "Errore durante la creazione dell'immobile" },
      { status: 500 }
    );
  }
}
