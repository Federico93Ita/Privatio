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

export const agencyLeadSchema = z.object({
  agencyName: z.string().min(2, "Nome agenzia richiesto"),
  contactName: z.string().min(2, "Nome contatto richiesto"),
  email: z.string().email("Email non valida"),
  phone: z.string().min(8, "Telefono richiesto"),
  city: z.string().min(2, "Città richiesta"),
  province: z.string().min(2, "Provincia richiesta"),
  agentCount: z.number().optional(),
  message: z.string().optional(),
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
  bathrooms: z.number().min(1, "Numero bagni richiesto"),
  floor: z.number().optional(),
  totalFloors: z.number().optional(),
  hasGarage: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  hasElevator: z.boolean().default(false),
  energyClass: z.string().optional(),
  yearBuilt: z.number().optional(),
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
});
