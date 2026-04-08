import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Profilo agenzia",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AgencyProfileReservedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: agencyId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/accedi");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "SELLER") redirect("/dashboard/venditore");

  const properties = await prisma.property.findMany({
    where: { sellerId: user.id, zoneId: { not: null } },
    select: { zoneId: true },
  });
  const zoneIds = properties
    .map((p) => p.zoneId)
    .filter((z): z is string => !!z);

  if (zoneIds.length === 0) redirect("/dashboard/venditore");

  const territory = await prisma.territoryAssignment.findFirst({
    where: { agencyId, zoneId: { in: zoneIds }, isActive: true },
  });
  if (!territory) {
    redirect("/dashboard/venditore");
  }

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    include: {
      reviews: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!agency) notFound();

  const usp = agency.uniqueSellingPoints || [];
  const spec = agency.specializations || [];
  const langs = agency.languages || [];
  const gallery = agency.gallery || [];
  const certs = agency.certifications || [];
  const awards = agency.awards || [];
  const areas = agency.serviceAreas || [];

  return (
    <div className="min-h-screen bg-[#f7f5ef]">
      {/* Hero */}
      <div className="relative h-64 md:h-80 bg-[#0B1D3A]">
        {agency.coverImageUrl && (
          <Image
            src={agency.coverImageUrl}
            alt=""
            fill
            className="object-cover opacity-70"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D3A]/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-5xl mx-auto">
          <div className="flex items-end gap-5">
            {agency.logoUrl ? (
              <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white">
                <Image src={agency.logoUrl} alt={agency.name} fill className="object-contain" />
              </div>
            ) : (
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-3xl font-bold text-[#0B1D3A]">
                {agency.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 text-white">
              <h1 className="text-2xl md:text-4xl font-bold">{agency.name}</h1>
              {agency.tagline && (
                <p className="text-[#C9A84C] mt-1 text-sm md:text-base">{agency.tagline}</p>
              )}
              <p className="text-white/80 text-sm mt-1">
                {agency.city}, {agency.province}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {agency.foundedYear && (
            <Stat label="Fondata nel" value={String(agency.foundedYear)} />
          )}
          {agency.teamSize && (
            <Stat label="Team" value={`${agency.teamSize} persone`} />
          )}
          {typeof agency.transactionsCount === "number" && agency.transactionsCount > 0 && (
            <Stat label="Transazioni" value={String(agency.transactionsCount)} />
          )}
          {agency.responseTimeHours && (
            <Stat label="Risposta entro" value={`${agency.responseTimeHours}h`} />
          )}
        </div>

        {/* USP */}
        {usp.length > 0 && (
          <Section title="Perché sceglierci">
            <ul className="grid md:grid-cols-2 gap-3">
              {usp.map((p, i) => (
                <li
                  key={i}
                  className="flex gap-3 p-4 rounded-xl bg-white border border-[#0B1D3A]/10"
                >
                  <span className="text-[#C9A84C] font-bold">✓</span>
                  <span className="text-[#0B1D3A]">{p}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Description */}
        {agency.description && (
          <Section title="Chi siamo">
            <p className="text-[#0B1D3A]/80 whitespace-pre-line leading-relaxed">
              {agency.description}
            </p>
          </Section>
        )}

        {/* Specializations */}
        {spec.length > 0 && (
          <Section title="Specializzazioni">
            <div className="flex flex-wrap gap-2">
              {spec.map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-[#0B1D3A] text-white text-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Service areas */}
        {areas.length > 0 && (
          <Section title="Zone di competenza">
            <div className="flex flex-wrap gap-2">
              {areas.map((a, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-[#C9A84C]/15 text-[#0B1D3A] text-sm border border-[#C9A84C]/30"
                >
                  {a}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Languages */}
        {langs.length > 0 && (
          <Section title="Lingue parlate">
            <p className="text-[#0B1D3A]/80">{langs.join(" · ")}</p>
          </Section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <Section title="Galleria">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {gallery.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl overflow-hidden bg-white border border-[#0B1D3A]/10"
                >
                  <Image src={url} alt="" fill className="object-cover" sizes="33vw" />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Video */}
        {agency.videoUrl && (
          <Section title="Video presentazione">
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={agency.videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Section>
        )}

        {/* Certifications & Awards */}
        {(certs.length > 0 || awards.length > 0) && (
          <Section title="Certificazioni e riconoscimenti">
            <div className="grid md:grid-cols-2 gap-4">
              {certs.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[#0B1D3A]/60 uppercase mb-2">
                    Certificazioni
                  </h4>
                  <ul className="space-y-1">
                    {certs.map((c, i) => (
                      <li key={i} className="text-[#0B1D3A]">• {c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {awards.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[#0B1D3A]/60 uppercase mb-2">
                    Premi
                  </h4>
                  <ul className="space-y-1">
                    {awards.map((a, i) => (
                      <li key={i} className="text-[#0B1D3A]">🏆 {a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Reviews */}
        {agency.reviews.length > 0 && (
          <Section title={`Recensioni (${agency.reviewCount})`}>
            <div className="space-y-3">
              {agency.reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl bg-white border border-[#0B1D3A]/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#0B1D3A]">
                      {r.user.name || "Utente"}
                    </span>
                    <span className="text-[#C9A84C]">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-[#0B1D3A]/80 text-sm">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Social */}
        {(agency.website ||
          agency.instagramUrl ||
          agency.facebookUrl ||
          agency.linkedinUrl) && (
          <Section title="Contatti e social">
            <div className="flex flex-wrap gap-3">
              {agency.website && (
                <SocialLink href={agency.website} label="Sito web" />
              )}
              {agency.instagramUrl && (
                <SocialLink href={agency.instagramUrl} label="Instagram" />
              )}
              {agency.facebookUrl && (
                <SocialLink href={agency.facebookUrl} label="Facebook" />
              )}
              {agency.linkedinUrl && (
                <SocialLink href={agency.linkedinUrl} label="LinkedIn" />
              )}
            </div>
          </Section>
        )}

        {/* Back CTA */}
        <div className="pt-4">
          <Link
            href="/dashboard/venditore"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0B1D3A] text-white font-semibold hover:bg-[#0B1D3A]/90 transition"
          >
            ← Torna alla scelta agenzia
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-white border border-[#0B1D3A]/10">
      <div className="text-xs text-[#0B1D3A]/60 uppercase tracking-wide">{label}</div>
      <div className="text-xl font-bold text-[#0B1D3A] mt-1">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-[#0B1D3A] mb-4">{title}</h2>
      {children}
    </section>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="px-4 py-2 rounded-lg border border-[#0B1D3A]/20 text-[#0B1D3A] hover:bg-[#0B1D3A] hover:text-white transition"
    >
      {label}
    </a>
  );
}
