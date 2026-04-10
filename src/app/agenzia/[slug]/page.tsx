import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agency = await prisma.agency.findUnique({
    where: { slug },
    select: { name: true, tagline: true, city: true, province: true },
  });

  if (!agency) return { title: "Agenzia non trovata — Privatio" };

  return {
    title: `${agency.name} — Agenzia Partner Privatio`,
    description: agency.tagline || `${agency.name} è un'agenzia partner Privatio a ${agency.city} (${agency.province}).`,
  };
}

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

const classColors: Record<string, string> = {
  BASE: "bg-blue-100 text-blue-700",
  URBANA: "bg-purple-100 text-purple-700",
  PREMIUM: "bg-amber-100 text-amber-700",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function AgencyPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const agency = await prisma.agency.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      city: true,
      province: true,
      tagline: true,
      description: true,
      logoUrl: true,
      coverImageUrl: true,
      foundedYear: true,
      teamSize: true,
      responseTimeHours: true,
      transactionsCount: true,
      specializations: true,
      languages: true,
      serviceAreas: true,
      gallery: true,
      certifications: true,
      awards: true,
      uniqueSellingPoints: true,
      website: true,
      instagramUrl: true,
      facebookUrl: true,
      linkedinUrl: true,
      whatsappNumber: true,
      rating: true,
      reviewCount: true,
      isActive: true,
      territories: {
        where: { isActive: true },
        select: {
          zone: {
            select: { name: true, zoneClass: true },
          },
        },
      },
    },
  });

  if (!agency || !agency.isActive) {
    notFound();
  }

  const stats = [
    agency.foundedYear && { label: "Anno fondazione", value: agency.foundedYear.toString() },
    agency.teamSize && { label: "Team", value: `${agency.teamSize} persone` },
    agency.responseTimeHours && { label: "Tempo risposta", value: agency.responseTimeHours <= 1 ? "< 1 ora" : `${agency.responseTimeHours} ore` },
    agency.transactionsCount && { label: "Transazioni", value: agency.transactionsCount.toString() },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      {/* Cover */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-[#0B1D3A] to-[#1a2d4a]">
        {agency.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={agency.coverImageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D3A]/80 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10 pb-16">
        {/* Header card */}
        <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 shadow-lg p-6 sm:p-8">
          <div className="flex items-start gap-5">
            {/* Logo */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#C9A84C]/20 to-[#C9A84C]/5 border border-[#C9A84C]/10 flex items-center justify-center shrink-0 overflow-hidden">
              {agency.logoUrl ? (
                <Image src={agency.logoUrl} alt={agency.name} fill className="object-cover rounded-2xl" sizes="96px" />
              ) : (
                <span className="text-3xl font-bold text-[#C9A84C]">{agency.name.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-heading font-normal text-[#0B1D3A]">{agency.name}</h1>
              <p className="text-[#0B1D3A]/50 mt-1">{agency.city}, {agency.province}</p>
              {agency.tagline && (
                <p className="text-[#0B1D3A]/70 mt-2 text-sm">{agency.tagline}</p>
              )}

              {/* Rating */}
              {agency.rating && agency.rating > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(agency.rating!) ? "text-[#C9A84C]" : "text-gray-200"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-[#0B1D3A]/50">
                    {agency.rating.toFixed(1)} ({agency.reviewCount} recensioni)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          {stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#0B1D3A]/5">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-lg font-semibold text-[#0B1D3A]">{s.value}</div>
                  <div className="text-xs text-[#0B1D3A]/40 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            {agency.description && (
              <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 p-6">
                <h2 className="font-heading text-lg text-[#0B1D3A] mb-3">Chi siamo</h2>
                <p className="text-[#0B1D3A]/70 text-sm leading-relaxed whitespace-pre-line">{agency.description}</p>
              </div>
            )}

            {/* USP */}
            {agency.uniqueSellingPoints.length > 0 && (
              <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 p-6">
                <h2 className="font-heading text-lg text-[#0B1D3A] mb-3">Perché sceglierci</h2>
                <ul className="space-y-2">
                  {agency.uniqueSellingPoints.map((usp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#0B1D3A]/70">
                      <svg className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {usp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gallery */}
            {agency.gallery.length > 0 && (
              <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 p-6">
                <h2 className="font-heading text-lg text-[#0B1D3A] mb-3">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {agency.gallery.slice(0, 6).map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt={`${agency.name} foto ${i + 1}`}
                      className="rounded-xl w-full h-32 object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Territories */}
            {agency.territories.length > 0 && (
              <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 p-6">
                <h2 className="font-heading text-lg text-[#0B1D3A] mb-3">Zone operative</h2>
                <div className="space-y-2">
                  {agency.territories.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${classColors[t.zone.zoneClass] || "bg-gray-100 text-gray-600"}`}>
                        {t.zone.zoneClass}
                      </span>
                      <span className="text-sm text-[#0B1D3A]/70">{t.zone.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specializations */}
            {agency.specializations.length > 0 && (
              <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 p-6">
                <h2 className="font-heading text-lg text-[#0B1D3A] mb-3">Specializzazioni</h2>
                <div className="flex flex-wrap gap-2">
                  {agency.specializations.map((s, i) => (
                    <span key={i} className="text-xs bg-[#0B1D3A]/5 text-[#0B1D3A]/70 px-3 py-1.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications & Awards */}
            {(agency.certifications.length > 0 || agency.awards.length > 0) && (
              <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 p-6">
                {agency.certifications.length > 0 && (
                  <>
                    <h2 className="font-heading text-lg text-[#0B1D3A] mb-2">Certificazioni</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {agency.certifications.map((c, i) => (
                        <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  </>
                )}
                {agency.awards.length > 0 && (
                  <>
                    <h2 className="font-heading text-lg text-[#0B1D3A] mb-2">Riconoscimenti</h2>
                    <div className="flex flex-wrap gap-2">
                      {agency.awards.map((a, i) => (
                        <span key={i} className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Languages */}
            {agency.languages.length > 0 && (
              <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 p-6">
                <h2 className="font-heading text-lg text-[#0B1D3A] mb-3">Lingue</h2>
                <div className="flex flex-wrap gap-2">
                  {agency.languages.map((l, i) => (
                    <span key={i} className="text-xs bg-[#0B1D3A]/5 text-[#0B1D3A]/70 px-3 py-1.5 rounded-full">{l}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact / Social links */}
            <div className="rounded-2xl bg-white border border-[#0B1D3A]/5 p-6">
              <h2 className="font-heading text-lg text-[#0B1D3A] mb-3">Contatti</h2>
              <div className="space-y-3">
                {agency.website && (
                  <a href={agency.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#C9A84C] hover:text-[#D4B65E] transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    Sito web
                  </a>
                )}
                {agency.instagramUrl && (
                  <a href={agency.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#0B1D3A]/60 hover:text-[#C9A84C] transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                    Instagram
                  </a>
                )}
                {agency.facebookUrl && (
                  <a href={agency.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#0B1D3A]/60 hover:text-[#C9A84C] transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    Facebook
                  </a>
                )}
                {agency.linkedinUrl && (
                  <a href={agency.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#0B1D3A]/60 hover:text-[#C9A84C] transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    LinkedIn
                  </a>
                )}
                {agency.whatsappNumber && (
                  <a href={`https://wa.me/${agency.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#0B1D3A]/60 hover:text-[#C9A84C] transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-[#0B1D3A]/40 hover:text-[#C9A84C] transition-colors">
            Torna alla homepage Privatio
          </Link>
        </div>
      </div>
    </div>
  );
}
