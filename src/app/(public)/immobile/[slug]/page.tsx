import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyGallery from "@/components/property/PropertyGallery";
import MortgageCalc from "@/components/property/MortgageCalc";
import PropertyMap from "@/components/property/PropertyMap";
import PropertyContactForm from "@/components/forms/PropertyContactForm";
import FavoriteButton from "@/components/property/FavoriteButton";
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

  if (!property) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-text mb-4">Immobile non trovato</h1>
            <p className="text-text-muted mb-6">L&apos;immobile che stai cercando non esiste o non è più disponibile.</p>
            <Link href="/cerca" className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/85 transition-colors">
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
      <main className="bg-bg-soft min-h-screen pt-28 md:pt-32">
        {/* Gallery (placeholder shown when no photos) */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <PropertyGallery photos={property.photos ?? []} />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* ── Breadcrumb ── */}
          <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/cerca" className="hover:text-primary transition-colors">Cerca</Link>
            <span>/</span>
            <Link href={`/cerca?city=${encodeURIComponent(property.city)}`} className="hover:text-primary transition-colors">{property.city}</Link>
            <span>/</span>
            <span className="text-text truncate max-w-[200px]">{property.title}</span>
          </nav>

          {/* ── Header: Title + Price ── */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
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
            <h1 className="text-3xl md:text-4xl font-light text-text tracking-tight mb-2">{property.title}</h1>
            <p className="text-text-muted text-lg mb-4">
              {property.address && `${property.address}, `}{property.city} ({property.province})
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-medium text-primary">{formatPrice(property.price)}</p>
                <p className="text-lg text-text-muted">
                  {pricePerSqm.toLocaleString("it-IT")} &euro;/mq
                </p>
              </div>
              <FavoriteButton propertyId={property.id} variant="button" />
            </div>
          </div>

          {/* ── Quick Stats Strip ── */}
          <div className="flex gap-3 overflow-x-auto pb-2 mb-8 -mx-4 px-4 scrollbar-thin">
            {quickStats.map((stat, i) => (
              <div key={i} className="flex-none bg-white rounded-xl px-5 py-3 border border-border min-w-[120px] text-center">
                <p className="text-lg font-medium text-text">{stat.value}</p>
                <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ── Main Grid ── */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {property.description && (
                <div className="bg-white rounded-xl p-6 border border-border">
                  <h2 className="font-medium text-xl text-text mb-4">Descrizione</h2>
                  <div className="border-l-2 border-primary/20 pl-4">
                    <p className="text-text-muted leading-relaxed whitespace-pre-line">{property.description}</p>
                  </div>
                </div>
              )}

              {/* Costs & Fees */}
              <div className="bg-white rounded-xl p-6 border border-border">
                <h2 className="font-medium text-xl text-text mb-5">Costi e spese</h2>
                <div className="divide-y divide-border">
                  <div className="flex justify-between items-center py-3">
                    <span className="text-text-muted">Prezzo immobile</span>
                    <span className="font-medium text-text">{formatPrice(property.price)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-text-muted">Prezzo al mq</span>
                    <span className="font-medium text-text">{pricePerSqm.toLocaleString("it-IT")} &euro;/mq</span>
                  </div>
                  {property.condominiumFees != null && property.condominiumFees > 0 && (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-text-muted">Spese condominiali</span>
                      <span className="font-medium text-text">{property.condominiumFees.toLocaleString("it-IT")} &euro;/mese</span>
                    </div>
                  )}
                  {property.extraCosts && (
                    <div className="py-3">
                      <span className="text-text-muted block mb-1">Costi aggiuntivi</span>
                      <p className="text-sm text-text">{property.extraCosts}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3">
                    <span className="text-text-muted">Commissione venditore</span>
                    <span className="font-medium text-success">0%</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-text-muted">Commissione acquirente</span>
                    <span className="font-medium text-text">2% &ndash; 2,5%</span>
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-4">
                  La commissione acquirente viene concordata in fase di trattativa. Nessun costo nascosto, massima trasparenza.
                </p>
              </div>

              {/* Features Grid */}
              <div className="bg-white rounded-xl p-6 border border-border">
                <h2 className="font-medium text-xl text-text mb-5">Caratteristiche</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ALL_FEATURES.map((f) => {
                    const hasFeature = (property as Record<string, unknown>)[f.key] === true;
                    return (
                      <div
                        key={f.key}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
                          hasFeature
                            ? "bg-success/5 text-text"
                            : "bg-gray-50 text-text-muted/50"
                        }`}
                      >
                        {hasFeature ? (
                          <svg className="w-4.5 h-4.5 text-success flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4.5 h-4.5 text-text-muted/30 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="bg-white rounded-xl p-6 border border-border">
                <h2 className="font-medium text-xl text-text mb-4">Posizione</h2>
                <PropertyMap lat={property.lat} lng={property.lng} city={property.city} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Form */}
              <div className="bg-white rounded-xl p-6 border border-border sticky top-24">
                <PropertyContactForm slug={property.slug} />
              </div>

              {/* Agency info */}
              {property.assignment?.agency && (
                <div className="bg-white rounded-xl p-5 border border-border">
                  <h3 className="font-medium text-primary-dark mb-3">Agenzia Partner</h3>
                  <p className="font-medium text-text">{property.assignment.agency.name}</p>
                  {property.assignment.agency.rating != null && property.assignment.agency.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className={`w-4 h-4 ${star <= Math.round(property.assignment!.agency.rating!) ? "text-accent" : "text-border"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-text-muted ml-1">{property.assignment.agency.rating}</span>
                    </div>
                  )}
                  {property.assignment.agency.phone && (
                    <p className="text-sm text-text-muted mt-1">{property.assignment.agency.phone}</p>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* ── Mortgage Calculator (full width, below grid) ── */}
          <div className="mt-16 pt-12">
            <div className="text-center mb-8">
              <h2 className="font-light text-2xl md:text-3xl text-text tracking-tight">
                Simula il tuo mutuo
              </h2>
              <p className="text-text-muted text-sm mt-2">
                Scopri quanto potrebbe costare la rata mensile per questo immobile
              </p>
            </div>
            <div className="lg:max-w-4xl mx-auto">
              <MortgageCalc defaultPrice={property.price} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
