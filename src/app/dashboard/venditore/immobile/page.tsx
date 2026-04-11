"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatPrice, getPropertyTypeLabel, getStatusLabel } from "@/lib/utils";

export default function SellerPropertyViewPage() {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/seller/property")
      .then((r) => r.json())
      .then((data) => {
        if (data.property) setProperty(data.property);
      })
      .catch(() => setError("Errore nel caricamento dell'immobile. Riprova."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="seller">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-bg-soft rounded-lg animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error || !property) {
    return (
      <DashboardLayout role="seller">
        <div className="bg-white rounded-xl p-8 border border-border text-center">
          <h2 className="text-lg font-medium text-primary-dark mb-2">
            {error || "Nessun immobile"}
          </h2>
          <p className="text-text-muted mb-4">Non hai ancora inserito un immobile.</p>
          <Link href="/vendi" className="text-primary hover:underline font-medium">
            Inserisci il tuo immobile
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const features = [
    { label: "Garage", value: property.hasGarage },
    { label: "Posto auto", value: property.hasParkingSpace },
    { label: "Giardino", value: property.hasGarden },
    { label: "Balcone", value: property.hasBalcony },
    { label: "Terrazza", value: property.hasTerrace },
    { label: "Ascensore", value: property.hasElevator },
    { label: "Cantina", value: property.hasCellar },
    { label: "Piscina", value: property.hasPool },
    { label: "Aria condizionata", value: property.hasAirConditioning },
    { label: "Arredato", value: property.isFurnished },
    { label: "Portineria", value: property.hasConcierge },
    { label: "Allarme", value: property.hasAlarm },
  ].filter((f) => f.value);

  return (
    <DashboardLayout role="seller">
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <Link
            href="/dashboard/venditore"
            className="text-sm text-primary hover:underline mb-2 inline-block"
          >
            &larr; Torna alla Dashboard
          </Link>
          <h1 className="text-2xl font-light tracking-[-0.03em] text-text">
            Il tuo Immobile
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {property.title} — {getStatusLabel(property.status)}
          </p>
        </div>

        {/* Info banner */}
        {property.assignment?.agency && (
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 text-sm text-primary-dark flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>
              L&apos;annuncio è gestito dalla tua agenzia partner{" "}
              <strong>{property.assignment.agency.name}</strong>. Per modifiche,
              contattala tramite i{" "}
              <Link href="/dashboard/venditore/messaggi" className="underline font-medium">
                Messaggi
              </Link>
              .
            </span>
          </div>
        )}

        {/* Photos */}
        {property.photos?.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-border">
            <h3 className="font-medium text-primary-dark mb-3">
              Foto ({property.photos.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {property.photos.map((photo: any, i: number) => (
                <div
                  key={photo.id || i}
                  className="relative aspect-square rounded-lg overflow-hidden bg-bg-soft"
                >
                  <Image
                    src={photo.url}
                    alt={`Foto ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info principali */}
        <div className="bg-white rounded-xl p-5 border border-border space-y-4">
          <h3 className="font-medium text-primary-dark">Informazioni</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <InfoItem label="Tipologia" value={getPropertyTypeLabel(property.type)} />
            <InfoItem label="Indirizzo" value={`${property.address}, ${property.city}`} />
            <InfoItem label="Prezzo" value={formatPrice(property.price)} />
            <InfoItem label="Superficie" value={`${property.surface} m²`} />
            <InfoItem label="Locali" value={property.rooms} />
            <InfoItem label="Bagni" value={property.bathrooms ?? "—"} />
            <InfoItem
              label="Piano"
              value={
                property.floor != null
                  ? `${property.floor}${property.totalFloors ? ` / ${property.totalFloors}` : ""}`
                  : "—"
              }
            />
            <InfoItem label="Classe energetica" value={property.energyClass || "—"} />
            <InfoItem label="Anno costruzione" value={property.yearBuilt || "—"} />
          </div>

          {property.condominiumFees != null && (
            <div className="pt-2 border-t border-border">
              <InfoItem
                label="Spese condominiali"
                value={`${property.condominiumFees} €/mese`}
              />
            </div>
          )}
        </div>

        {/* Descrizione */}
        {property.description && (
          <div className="bg-white rounded-xl p-5 border border-border">
            <h3 className="font-medium text-primary-dark mb-3">Descrizione</h3>
            <p className="text-sm text-text leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>
        )}

        {/* Caratteristiche */}
        {features.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-border">
            <h3 className="font-medium text-primary-dark mb-3">Caratteristiche</h3>
            <div className="flex flex-wrap gap-2">
              {features.map((f) => (
                <span
                  key={f.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stato e dettagli aggiuntivi */}
        {(property.condition || property.heatingType || property.extraCosts) && (
          <div className="bg-white rounded-xl p-5 border border-border space-y-3">
            <h3 className="font-medium text-primary-dark">Dettagli aggiuntivi</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {property.condition && (
                <InfoItem label="Stato immobile" value={property.condition} />
              )}
              {property.heatingType && (
                <InfoItem label="Riscaldamento" value={property.heatingType} />
              )}
            </div>
            {property.extraCosts && (
              <div className="pt-2 border-t border-border">
                <span className="text-xs text-text-muted">Costi aggiuntivi</span>
                <p className="text-sm text-text mt-0.5">{property.extraCosts}</p>
              </div>
            )}
          </div>
        )}

        {/* Agenzia partner */}
        {property.assignment?.agency && (
          <div className="bg-white rounded-xl p-5 border border-border">
            <h3 className="font-medium text-primary-dark mb-3">Agenzia Partner</h3>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                {property.assignment.agency.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-text">
                  {property.assignment.agency.name}
                </p>
                {property.assignment.agency.phone && (
                  <p className="text-sm text-text-muted">
                    {property.assignment.agency.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

/** Small read-only info display component */
function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span className="text-xs text-text-muted">{label}</span>
      <p className="font-medium text-primary-dark text-sm">{String(value)}</p>
    </div>
  );
}
