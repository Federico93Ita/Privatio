import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

/**
 * Standard commission rate that traditional agencies charge the seller.
 * Privatio sellers save this percentage.
 */
export const TRADITIONAL_COMMISSION_RATE = 0.03;

/** Merges Tailwind classes safely, resolving conflicts (e.g. p-2 + p-4 → p-4). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("it-IT").format(num);
}

export function generateSlug(type: string, rooms: number, city: string, id: string): string {
  const typeSlug = slugify(type.toLowerCase().replace(/_/g, "-"), { lower: true, strict: true });
  const citySlug = slugify(city, { lower: true, strict: true });
  const shortId = id.slice(-8);
  return `${typeSlug}-${rooms}-locali-${citySlug}-${shortId}`;
}

export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    APPARTAMENTO: "Appartamento",
    VILLA: "Villa",
    CASA_INDIPENDENTE: "Casa Indipendente",
    ATTICO: "Attico",
    MANSARDA: "Mansarda",
    LOFT: "Loft",
    TERRENO: "Terreno",
    NEGOZIO: "Negozio",
    UFFICIO: "Ufficio",
  };
  return labels[type] || type;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Bozza",
    PENDING_REVIEW: "In revisione",
    PUBLISHED: "Pubblicato",
    UNDER_CONTRACT: "In trattativa",
    SOLD: "Venduto",
    WITHDRAWN: "Ritirato",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING_REVIEW: "bg-amber-100 text-amber-700",
    PUBLISHED: "bg-green-100 text-green-700",
    UNDER_CONTRACT: "bg-blue-100 text-blue-700",
    SOLD: "bg-purple-100 text-purple-700",
    WITHDRAWN: "bg-red-100 text-red-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

/** Returns the amount saved by using Privatio vs a traditional agency. */
export function calculateSavings(price: number): number {
  return Math.round(price * TRADITIONAL_COMMISSION_RATE);
}

export function calculateMortgage(
  price: number,
  downPaymentPercent: number,
  years: number,
  rate: number
): number {
  const principal = price * (1 - downPaymentPercent / 100);
  const monthlyRate = rate / 100 / 12;
  const numPayments = years * 12;

  if (monthlyRate === 0) return principal / numPayments;

  return (
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
