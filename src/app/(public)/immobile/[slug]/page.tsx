import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyGallery from "@/components/property/PropertyGallery";
import MortgageCalc from "@/components/property/MortgageCalc";
import PropertyMap from "@/components/property/PropertyMap";
import PropertyContactForm from "@/components/forms/PropertyContactForm";
import { formatPrice, getPropertyTypeLabel } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProperty(slug: string) {
  try {
    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        photos: { orderBy: { order: "asc" } },
        seller: { select: { name: true } },
        assignment: {
          include: {
            agency: {
              select: { name: true, phone: true, logoUrl: true, rating: true },
            },
          },
        },
      },
    });

    if (!property || property.status === "DRAFT") return null;

    // Increment view count (fire-and-forget, non-blocking)
    prisma.property
      .update({
        where: { id: property.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    return property;
  } catch (error) {
    console.error("Error fetching property:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) return { title: "Immobile non trovato" };

  return {
    title: `${property.title} — ${formatPrice(property.price)}`,
    description: property.description?.slice(0, 160) || `${getPropertyTypeLabel(property.type)} in ${property.city}. ${property.rooms} locali, ${property.surface} mq. ${formatPrice(property.price)}`,
    openGraph: {
      title: property.title,
      description: `${getPropertyTypeLabel(property.type)} — ${property.rooms} locali, ${property.surface} mq — ${formatPrice(property.price)}`,
      images: property.photos?.[0]?.url ? [property.photos[0].url] : [],
    },
  };
}

/** Builds a Schema.org RealEstateListing JSON-LD block for the property */
function buildPropertySchema(property: {
  title: string;
  description?: string | null;
  price: number;
  type: string;
  surface: number;
  rooms: number;
  address: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  photos?: { url: string }[];
  slug: string;
}) {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://privatio.it";
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description ?? undefined,
    url: `${BASE_URL}/immobile/${property.slug}`,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.surface,
      unitCode: "MTK",
    },
    numberOfRooms: property.rooms,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.province,
      addressCountry: "IT",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.lat,
      longitude: property.lng,
    },
    image: property.photos?.map((p) => p.url) ?? [],
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await getProperty(slug);

  if (!property) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0a1f44] mb-4">Immobile non trovato</h1>
            <p className="text-[#64748b] mb-6">L&apos;immobile che stai cercando non esiste o non è più disponibile.</p>
            <Link href="/cerca" className="px-6 py-3 bg-[#0e8ff1] text-white rounded-lg font-semibold hover:bg-[#0a1f44] transition-colors">
              Cerca altri immobili
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const features = [
    { key: "hasGarage", label: "Garage", value: property.hasGarage },
    { key: "hasGarden", label: "Giardino", value: property.hasGarden },
    { key: "hasBalcony", label: "Balcone", value: property.hasBalcony },
    { key: "hasElevator", label: "Ascensore", value: property.hasElevator },
  ].filter((f) => f.value);

  const schemaData = buildPropertySchema(property);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <Header />
      <main className="bg-[#f8fafc] min-h-screen">
        {/* Gallery */}
        {property.photos?.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 pt-6">
            <PropertyGallery photos={property.photos} />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & badges */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 bg-[#0e8ff1]/10 text-[#0e8ff1] rounded-full text-sm font-medium">
                    {getPropertyTypeLabel(property.type)}
                  </span>
                  {property.energyClass && (
                    <span className="px-3 py-1 bg-[#10b981]/10 text-[#10b981] rounded-full text-sm font-medium">
                      Classe {property.energyClass}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-[#10b981]/10 text-[#10b981] rounded-full text-sm font-semibold">
                    0% comm. venditore
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#0a1f44] mb-2">{property.title}</h1>
                <p className="text-[#64748b] text-lg">
                  {property.address && `${property.address}, `}{property.city} ({property.province})
                </p>
                <p className="text-4xl font-bold text-[#0e8ff1] mt-4">{formatPrice(property.price)}</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Superficie", value: `${property.surface} mq`, icon: "📐" },
                  { label: "Locali", value: property.rooms, icon: "🏠" },
                  { label: "Bagni", value: property.bathrooms, icon: "🚿" },
                  { label: "Piano", value: property.floor != null ? `${property.floor}/${property.totalFloors || "—"}` : "—", icon: "🏢" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-[#e2e8f0] text-center">
                    <span className="text-2xl">{stat.icon}</span>
                    <p className="text-xl font-bold text-[#0a1f44] mt-1">{stat.value}</p>
                    <p className="text-sm text-[#64748b]">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Features */}
              {features.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
                  <h2 className="font-heading text-xl text-[#0a1f44] mb-4">CARATTERISTICHE</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {features.map((f) => (
                      <div key={f.key} className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-[#1e293b]">{f.label}</span>
                      </div>
                    ))}
                    {property.yearBuilt && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[#1e293b]">Anno: {property.yearBuilt}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {property.description && (
                <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
                  <h2 className="font-heading text-xl text-[#0a1f44] mb-4">DESCRIZIONE</h2>
                  <p className="text-[#64748b] leading-relaxed whitespace-pre-line">{property.description}</p>
                </div>
              )}

              {/* Map */}
              <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
                <h2 className="font-heading text-xl text-[#0a1f44] mb-4">POSIZIONE</h2>
                <PropertyMap lat={property.lat} lng={property.lng} city={property.city} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Commission info */}
              <div className="bg-[#0e8ff1]/5 border border-[#0e8ff1]/20 rounded-xl p-5">
                <h3 className="font-semibold text-[#0a1f44] mb-2">Commissioni trasparenti</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Commissione venditore</span>
                    <span className="font-bold text-[#10b981]">0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Commissione acquirente</span>
                    <span className="font-semibold text-[#0a1f44]">2% - 2.5%</span>
                  </div>
                </div>
                <p className="text-xs text-[#64748b] mt-3">
                  La commissione acquirente viene concordata in fase di trattativa.
                  Nessun costo nascosto, massima trasparenza.
                </p>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-xl p-6 border border-[#e2e8f0] sticky top-24">
                <PropertyContactForm slug={property.slug} />
              </div>

              {/* Agency info */}
              {property.assignment?.agency && (
                <div className="bg-white rounded-xl p-5 border border-[#e2e8f0]">
                  <h3 className="font-semibold text-[#0a1f44] mb-3">Agenzia Partner</h3>
                  <p className="font-medium text-[#1e293b]">{property.assignment.agency.name}</p>
                  {property.assignment.agency.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className={`w-4 h-4 ${star <= Math.round(property.assignment!.agency.rating!) ? "text-[#f59e0b]" : "text-[#e2e8f0]"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-[#64748b] ml-1">{property.assignment.agency.rating}</span>
                    </div>
                  )}
                  <p className="text-sm text-[#64748b] mt-1">{property.assignment.agency.phone}</p>
                </div>
              )}

              {/* Mortgage Calculator */}
              <div className="bg-white rounded-xl p-6 border border-[#e2e8f0]">
                <MortgageCalc defaultPrice={property.price} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
