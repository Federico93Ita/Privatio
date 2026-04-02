import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";

/** ISR: revalidate property pages every 60 minutes */
export const revalidate = 3600;
import Footer from "@/components/layout/Footer";
import PropertyGallery from "@/components/property/PropertyGallery";
import MortgageCalc from "@/components/property/MortgageCalc";
import PropertyMap from "@/components/property/PropertyMap";
import NearbyPOI from "@/components/property/NearbyPOI";
import PropertyValuation from "@/components/property/PropertyValuation";
import PropertyContactForm from "@/components/forms/PropertyContactForm";
import FavoriteButton from "@/components/property/FavoriteButton";
import { formatPrice, getPropertyTypeLabel } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import PropertyCard from "@/components/property/PropertyCard";

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

async function getSimilarProperties(property: {
  id: string; city: string; province: string; type: string;
  price: number; surface: number; rooms: number;
  lat: number | null; lng: number | null;
  hasGarage: boolean; hasGarden: boolean; hasBalcony: boolean;
  hasElevator: boolean; hasPool: boolean; hasAirConditioning: boolean;
}) {
  try {
    const priceMin = Math.round(property.price * 0.7);
    const priceMax = Math.round(property.price * 1.3);

    // Fetch candidates from same province within price range
    const candidates = await prisma.property.findMany({
      where: {
        id: { not: property.id },
        status: "PUBLISHED",
        province: property.province,
        price: { gte: priceMin, lte: priceMax },
      },
      include: {
        photos: { where: { isCover: true }, take: 1 },
      },
      take: 50,
    });

    // Score each candidate by similarity
    const scored = candidates.map((c) => {
      let score = 0;

      // Same city: +30
      if (c.city.toLowerCase() === property.city.toLowerCase()) score += 30;

      // Same type: +20
      if (c.type === property.type) score += 20;

      // Similar surface (within 30%): +10
      if (property.surface > 0 && c.surface > 0) {
        const surfaceRatio = c.surface / property.surface;
        if (surfaceRatio >= 0.7 && surfaceRatio <= 1.3) score += 10;
      }

      // Same rooms: +10
      if (c.rooms === property.rooms) score += 10;

      // Matching features: +3 each
      const features = ["hasGarage", "hasGarden", "hasBalcony", "hasElevator", "hasPool", "hasAirConditioning"] as const;
      for (const f of features) {
        if (c[f] === property[f] && c[f] === true) score += 3;
      }

      // Geographic proximity (if coordinates available): up to +25
      if (property.lat && property.lng && c.lat && c.lng) {
        const R = 6371;
        const dLat = ((c.lat - property.lat) * Math.PI) / 180;
        const dLng = ((c.lng - property.lng) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos((property.lat * Math.PI) / 180) * Math.cos((c.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        // Within 2km: +25, within 5km: +15, within 10km: +5
        if (dist <= 2) score += 25;
        else if (dist <= 5) score += 15;
        else if (dist <= 10) score += 5;
      }

      return { ...c, _score: score };
    });

    // Sort by score descending, take top 6
    scored.sort((a, b) => b._score - a._score);
    return scored.slice(0, 6).map(({ _score, ...rest }) => rest);
  } catch {
    return [];
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

/* ------------------------------------------------------------------ */
/*  All features config                                                */
/* ------------------------------------------------------------------ */

const ALL_FEATURES = [
  { key: "hasGarage", label: "Garage", icon: "garage" },
  { key: "hasParkingSpace", label: "Posto auto", icon: "parking" },
  { key: "hasGarden", label: "Giardino", icon: "garden" },
  { key: "hasBalcony", label: "Balcone", icon: "balcony" },
  { key: "hasTerrace", label: "Terrazza", icon: "terrace" },
  { key: "hasElevator", label: "Ascensore", icon: "elevator" },
  { key: "hasCellar", label: "Cantina", icon: "cellar" },
  { key: "hasPool", label: "Piscina", icon: "pool" },
  { key: "hasAirConditioning", label: "Aria condizionata", icon: "ac" },
  { key: "isFurnished", label: "Arredato", icon: "furnished" },
  { key: "hasConcierge", label: "Portineria", icon: "concierge" },
  { key: "hasAlarm", label: "Allarme", icon: "alarm" },
] as const;

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await getProperty(slug);
  const similarProperties = property
    ? await getSimilarProperties({
        id: property.id,
        city: property.city,
        province: property.province,
        type: property.type,
        price: property.price,
        surface: property.surface,
        rooms: property.rooms,
        lat: property.lat,
        lng: property.lng,
        hasGarage: property.hasGarage,
        hasGarden: property.hasGarden,
        hasBalcony: property.hasBalcony,
        hasElevator: property.hasElevator,
        hasPool: property.hasPool,
        hasAirConditioning: property.hasAirConditioning,
      })
    : [];

  if (!property) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center bg-[#0B1D3A]">
          <div className="text-center">
            <h1 className="font-heading text-2xl font-medium text-white mb-4">Immobile non trovato</h1>
            <p className="text-white/60 mb-6">L&apos;immobile che stai cercando non esiste o non è più disponibile.</p>
            <Link href="/cerca" className="px-6 py-3 bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] text-[#0B1D3A] rounded-lg font-medium hover:opacity-90 transition-opacity">
              Cerca altri immobili
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const pricePerSqm = Math.round(property.price / property.surface);
  const schemaData = buildPropertySchema(property);

  // Build quick stats array
  const quickStats = [
    { label: "Superficie", value: `${property.surface} mq`, icon: "surface" },
    { label: "Locali", value: `${property.rooms}`, icon: "rooms" },
    { label: "Bagni", value: `${property.bathrooms}`, icon: "bathrooms" },
  ];
  if (property.floor != null) {
    quickStats.push({ label: "Piano", value: `${property.floor}/${property.totalFloors || "—"}`, icon: "floor" });
  }
  if (property.condition) {
    quickStats.push({ label: "Stato", value: property.condition, icon: "condition" });
  }
  if (property.heatingType) {
    quickStats.push({ label: "Riscaldamento", value: property.heatingType, icon: "heating" });
  }
  if (property.energyClass) {
    quickStats.push({ label: "Classe energ.", value: property.energyClass, icon: "energy" });
  }
  if (property.yearBuilt) {
    quickStats.push({ label: "Anno", value: `${property.yearBuilt}`, icon: "year" });
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <Header />
      <main className="bg-[#F8F6F1] grain min-h-screen pt-28 md:pt-32">
        {/* Gallery (placeholder shown when no photos) */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <PropertyGallery photos={property.photos ?? []} propertyType={property.type} />

          {/* Video tour / Virtual tour */}
          {(property.videoUrl || property.virtualTourUrl) && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {property.videoUrl && (
                <div className="bg-white rounded-3xl p-4 border border-[#C9A84C]/[0.08]">
                  <h3 className="font-heading font-medium text-[#0B1D3A] mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    Video tour
                  </h3>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                    <iframe
                      src={property.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Video tour dell'immobile"
                    />
                  </div>
                </div>
              )}
              {property.virtualTourUrl && (
                <div className="bg-white rounded-3xl p-4 border border-[#C9A84C]/[0.08]">
                  <h3 className="font-heading font-medium text-[#0B1D3A] mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#C9A84C]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    Virtual tour 360°
                  </h3>
                  <div className="aspect-video rounded-2xl overflow-hidden">
                    <iframe
                      src={property.virtualTourUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title="Virtual tour 360° dell'immobile"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* ── Breadcrumb ── */}
          <nav className="flex items-center gap-2 text-sm text-[#0B1D3A]/40 mb-6">
            <Link href="/" className="hover:text-[#C9A84C] transition-colors">Home</Link>
            <span className="text-[#0B1D3A]/20">/</span>
            <Link href="/cerca" className="hover:text-[#C9A84C] transition-colors">Cerca</Link>
            <span className="text-[#0B1D3A]/20">/</span>
            <Link href={`/cerca?city=${encodeURIComponent(property.city)}`} className="hover:text-[#C9A84C] transition-colors">{property.city}</Link>
            <span className="text-[#0B1D3A]/20">/</span>
            <span className="text-[#0B1D3A]/60 truncate max-w-[200px]">{property.title}</span>
          </nav>

          {/* ── Header: Title + Price ── */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-[#C9A84C]/10 text-[#C9A84C] rounded-full text-sm font-medium">
                {getPropertyTypeLabel(property.type)}
              </span>
              {property.energyClass && (
                <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
                  Classe {property.energyClass}
                </span>
              )}
              <span className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
                0% comm. venditore
              </span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-light text-[#0B1D3A] tracking-tight mb-2">{property.title}</h1>
            <p className="text-[#0B1D3A]/50 text-lg mb-4">
              {property.address && `${property.address}, `}{property.city} ({property.province})
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-medium bg-gradient-to-r from-[#C9A84C] to-[#D4B65E] bg-clip-text text-transparent">{formatPrice(property.price)}</p>
                <p className="text-lg text-[#0B1D3A]/50">
                  {pricePerSqm.toLocaleString("it-IT")} &euro;/mq
                </p>
              </div>
              <FavoriteButton propertyId={property.id} variant="button" />
            </div>
          </div>

          {/* ── Quick Stats Strip ── */}
          <div className="flex gap-3 overflow-x-auto pb-2 mb-8 -mx-4 px-4 scrollbar-thin">
            {quickStats.map((stat, i) => (
              <div key={i} className="flex-none bg-white rounded-2xl px-5 py-3 border border-[#C9A84C]/[0.08] border-t-2 border-t-[#C9A84C]/30 min-w-[120px] text-center">
                <p className="text-lg font-medium text-[#0B1D3A]">{stat.value}</p>
                <p className="text-xs text-[#0B1D3A]/50 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ── Main Grid ── */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {property.description && (
                <div className="bg-white rounded-3xl p-6 border border-[#C9A84C]/[0.08]">
                  <h2 className="font-heading font-medium text-xl text-[#0B1D3A] mb-4">Descrizione</h2>
                  <div className="border-l-2 border-[#C9A84C]/30 pl-4">
                    <p className="text-[#0B1D3A]/60 leading-relaxed whitespace-pre-line">{property.description}</p>
                  </div>
                </div>
              )}

              {/* Costs & Fees */}
              <div className="bg-white rounded-3xl p-6 border border-[#C9A84C]/[0.08]">
                <h2 className="font-heading font-medium text-xl text-[#0B1D3A] mb-5">Costi e spese</h2>
                <div className="divide-y divide-[#C9A84C]/[0.08]">
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[#0B1D3A]/60">Prezzo immobile</span>
                    <span className="font-medium text-[#0B1D3A]">{formatPrice(property.price)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[#0B1D3A]/60">Prezzo al mq</span>
                    <span className="font-medium text-[#0B1D3A]">{pricePerSqm.toLocaleString("it-IT")} &euro;/mq</span>
                  </div>
                  {property.condominiumFees != null && property.condominiumFees > 0 && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-[#0B1D3A]/60">Spese condominiali</span>
                      <span className="font-medium text-[#0B1D3A]">{property.condominiumFees.toLocaleString("it-IT")} &euro;/mese</span>
                    </div>
                  )}
                  {property.extraCosts && (
                    <div className="py-3">
                      <span className="text-[#0B1D3A]/60 block mb-1">Costi aggiuntivi</span>
                      <p className="text-sm text-[#0B1D3A]">{property.extraCosts}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 bg-[#C9A84C]/5 -mx-6 px-6 rounded-xl">
                    <span className="text-[#0B1D3A]/60">Commissione venditore</span>
                    <span className="font-medium text-success">0%</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[#0B1D3A]/60">Commissione acquirente</span>
                    <span className="font-medium text-[#0B1D3A]">2% &ndash; 2,5%</span>
                  </div>
                </div>
                <p className="text-xs text-[#0B1D3A]/40 mt-4">
                  La commissione acquirente viene concordata in fase di trattativa. Nessun costo nascosto, massima trasparenza.
                </p>
              </div>

              {/* Features Grid */}
              <div className="bg-white rounded-3xl p-6 border border-[#C9A84C]/[0.08]">
                <h2 className="font-heading font-medium text-xl text-[#0B1D3A] mb-5">Caratteristiche</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ALL_FEATURES.map((f) => {
                    const hasFeature = (property as Record<string, unknown>)[f.key] === true;
                    return (
                      <div
                        key={f.key}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
                          hasFeature
                            ? "bg-[#C9A84C]/5 text-[#0B1D3A]"
                            : "bg-gray-50 text-[#0B1D3A]/30"
                        }`}
                      >
                        {hasFeature ? (
                          <svg className="w-4.5 h-4.5 text-success flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4.5 h-4.5 text-[#0B1D3A]/15 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span>{f.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Map */}
              <div className="bg-white rounded-3xl p-6 border border-[#C9A84C]/[0.08]">
                <h2 className="font-heading font-medium text-xl text-[#0B1D3A] mb-4">Posizione</h2>
                <PropertyMap lat={property.lat} lng={property.lng} city={property.city} />
              </div>

              {/* Nearby POI */}
              <div className="bg-white rounded-3xl p-6 border border-[#C9A84C]/[0.08]">
                <h2 className="font-heading font-medium text-xl text-[#0B1D3A] mb-4">Nelle vicinanze</h2>
                <NearbyPOI lat={property.lat} lng={property.lng} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Form */}
              <div className="bg-white rounded-3xl p-6 border border-[#C9A84C]/[0.08] sticky top-24">
                <PropertyContactForm slug={property.slug} />
              </div>

              {/* Agency info */}
              {property.assignment?.agency && (
                <div className="bg-white rounded-3xl p-5 border border-[#C9A84C]/[0.08]">
                  <h3 className="font-heading font-medium text-[#0B1D3A] mb-3">Agenzia Partner</h3>
                  <p className="font-medium text-[#0B1D3A]">{property.assignment.agency.name}</p>
                  {property.assignment.agency.rating != null && property.assignment.agency.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className={`w-4 h-4 ${star <= Math.round(property.assignment!.agency.rating!) ? "text-[#C9A84C]" : "text-[#C9A84C]/20"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-[#0B1D3A]/50 ml-1">{property.assignment.agency.rating}</span>
                    </div>
                  )}
                  {property.assignment.agency.phone && (
                    <p className="text-sm text-[#0B1D3A]/50 mt-1">{property.assignment.agency.phone}</p>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* ── Property Valuation ── */}
          <div className="mt-16 pt-12">
            <div className="text-center mb-8">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C]/70 mb-3">Analisi</p>
              <h2 className="font-heading font-light text-2xl md:text-3xl text-[#0B1D3A] tracking-tight">
                Analisi di mercato
              </h2>
              <p className="text-[#0B1D3A]/50 text-sm mt-2">
                Come si posiziona questo immobile rispetto al mercato di {property.city}
              </p>
            </div>
            <div className="lg:max-w-3xl mx-auto">
              <div className="bg-white rounded-3xl p-8 border border-[#C9A84C]/[0.08] shadow-sm">
                <PropertyValuation
                  city={property.city}
                  province={property.province}
                  surface={property.surface}
                  rooms={property.rooms}
                  price={property.price}
                  type={property.type}
                />
              </div>
            </div>
          </div>

          {/* ── Mortgage Calculator (full width, below valuation) ── */}
          <div className="mt-16 pt-12 border-t border-[#C9A84C]/10">
            <div className="text-center mb-8">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C]/70 mb-3">Mutuo</p>
              <h2 className="font-heading font-light text-2xl md:text-3xl text-[#0B1D3A] tracking-tight">
                Simula il tuo mutuo
              </h2>
              <p className="text-[#0B1D3A]/50 text-sm mt-2">
                Scopri quanto potrebbe costare la rata mensile per questo immobile
              </p>
            </div>
            <div className="lg:max-w-4xl mx-auto">
              <MortgageCalc defaultPrice={property.price} />
            </div>
          </div>

          {/* ── Similar Properties ── */}
          {similarProperties.length > 0 && (
            <div className="mt-16 pt-12 border-t border-[#C9A84C]/10">
              <div className="text-center mb-8">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9A84C]/70 mb-3">Scopri</p>
                <h2 className="font-heading font-light text-2xl md:text-3xl text-[#0B1D3A] tracking-tight">
                  Immobili simili
                </h2>
                <p className="text-[#0B1D3A]/50 text-sm mt-2">
                  Altri immobili che potrebbero interessarti
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {similarProperties.map((sp) => (
                  <PropertyCard
                    key={sp.id}
                    property={{
                      id: sp.id,
                      slug: sp.slug,
                      title: sp.title,
                      city: sp.city,
                      province: sp.province,
                      price: sp.price,
                      surface: sp.surface,
                      rooms: sp.rooms,
                      bathrooms: sp.bathrooms ?? 0,
                      type: sp.type,
                      hasGarage: sp.hasGarage,
                      hasGarden: sp.hasGarden,
                      hasBalcony: sp.hasBalcony,
                      hasElevator: sp.hasElevator,
                      photos: sp.photos.map((p) => ({ url: p.url, isCover: p.isCover })),
                    }}
                  />
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  href={`/cerca?city=${encodeURIComponent(property.city)}`}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-[#C9A84C]/30 rounded-lg text-sm font-medium text-[#C9A84C] hover:bg-[#C9A84C]/5 transition-colors"
                >
                  Vedi tutti gli immobili a {property.city}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
