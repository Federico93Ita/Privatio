import { z } from "zod";

export const sellerLeadSchema = z.object({
  name: z.string().min(2, "Nome richiesto"),
  email: z.string().email("Email non valida"),
  phone: z.string().min(8, "Telefono richiesto"),
  city: z.string().min(2, "Città richiesta"),
  province: z.string().min(2, "Provincia richiesta"),
  propertyType: z.string().optional(),
  estimatedValue: z.number().optional(),
  source: z.string().optional(),
});

export const zonePreferenceSchema = z.object({
  zoneId: z.string(),
  zoneName: z.string(),
  zoneClass: z.string(),
  plan: z.string().optional(),
  priceMonthly: z.number().optional(),
});

export const agencyLeadSchema = z.object({
  agencyName: z.string().min(2, "Nome agenzia richiesto"),
  contactName: z.string().min(2, "Nome contatto richiesto"),
  email: z.string().email("Email non valida"),
  phone: z.string().min(8, "Telefono richiesto"),
  address: z.string().optional(),
  city: z.string().min(2, "Città richiesta"),
  province: z.string().min(2, "Provincia richiesta"),
  agentCount: z.number().optional(),
  message: z.string().optional(),
  preferredZones: z.array(zonePreferenceSchema).max(3).optional(),
});

export const propertySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  type: z.enum([
    "APPARTAMENTO",
    "VILLA",
    "CASA_INDIPENDENTE",
    "ATTICO",
    "MANSARDA",
    "LOFT",
    "TERRENO",
    "NEGOZIO",
    "UFFICIO",
  ]),
  price: z.number().min(1000, "Prezzo non valido"),
  surface: z.number().min(1, "Superficie richiesta"),
  rooms: z.number().min(1, "Numero locali richiesto"),
  bathrooms: z.number().min(0).optional(),
  floor: z.number().optional(),
  totalFloors: z.number().optional(),
  hasGarage: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  hasElevator: z.boolean().default(false),
  hasParkingSpace: z.boolean().default(false),
  hasCellar: z.boolean().default(false),
  hasTerrace: z.boolean().default(false),
  hasPool: z.boolean().default(false),
  hasAirConditioning: z.boolean().default(false),
  isFurnished: z.boolean().default(false),
  hasConcierge: z.boolean().default(false),
  hasAlarm: z.boolean().default(false),
  energyClass: z.string().optional(),
  yearBuilt: z.number().optional(),
  condominiumFees: z.number().min(0).optional(),
  extraCosts: z.string().optional(),
  condition: z.string().optional(),
  heatingType: z.string().optional(),
  address: z.string().min(5, "Indirizzo richiesto"),
  city: z.string().min(2, "Città richiesta"),
  province: z.string().min(2, "Provincia richiesta"),
  cap: z.string().min(5, "CAP richiesto"),
  lat: z.number(),
  lng: z.number(),
});

export const buyerLeadSchema = z.object({
  name: z.string().min(2, "Nome richiesto"),
  email: z.string().email("Email non valida"),
  phone: z.string().optional(),
  message: z.string().optional(),
});

export const visitSchema = z.object({
  buyerName: z.string().min(2, "Nome richiesto"),
  buyerEmail: z.string().email("Email non valida"),
  buyerPhone: z.string().min(8, "Telefono richiesto"),
  scheduledAt: z.string(),
  notes: z.string().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome richiesto"),
  email: z.string().email("Email non valida"),
  phone: z.string().min(8, "Telefono richiesto"),
  password: z.string().min(8, "Password minimo 8 caratteri"),
  role: z.enum(["SELLER", "BUYER"]).optional(),
  // Consent tracking
  accettaTermini: z.boolean().optional(),
  accettaPrivacy: z.boolean().optional(),
  accettaFase2: z.boolean().optional(),
  accettaClausole: z.boolean().optional(),
  accettaMarketing: z.boolean().optional(),
  termsVersion: z.string().optional(),
});
