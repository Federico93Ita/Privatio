import { describe, it, expect } from "vitest";
import {
  registerSchema,
  buyerLeadSchema,
  propertySchema,
  sellerLeadSchema,
  agencyLeadSchema,
} from "@/lib/validations";

/* ------------------------------------------------------------------ */
/*  registerSchema                                                     */
/* ------------------------------------------------------------------ */

describe("registerSchema", () => {
  const validUser = {
    name: "Mario Rossi",
    email: "mario@example.com",
    phone: "3331234567",
    password: "Password1!",
  };

  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it("rejects email without @", () => {
    const result = registerSchema.safeParse({ ...validUser, email: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 chars", () => {
    const result = registerSchema.safeParse({ ...validUser, password: "Ab1!" });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = registerSchema.safeParse({ ...validUser, password: "password1!" });
    expect(result.success).toBe(false);
  });

  it("rejects password without number", () => {
    const result = registerSchema.safeParse({ ...validUser, password: "Password!" });
    expect(result.success).toBe(false);
  });

  it("rejects password without special char", () => {
    const result = registerSchema.safeParse({ ...validUser, password: "Password1" });
    expect(result.success).toBe(false);
  });

  it("rejects name shorter than 2 chars", () => {
    const result = registerSchema.safeParse({ ...validUser, name: "M" });
    expect(result.success).toBe(false);
  });

  it("rejects phone shorter than 8 chars", () => {
    const result = registerSchema.safeParse({ ...validUser, phone: "123" });
    expect(result.success).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  buyerLeadSchema                                                    */
/* ------------------------------------------------------------------ */

describe("buyerLeadSchema", () => {
  it("accepts valid lead with required fields only", () => {
    const result = buyerLeadSchema.safeParse({
      name: "Anna Bianchi",
      email: "anna@test.com",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid lead with all fields", () => {
    const result = buyerLeadSchema.safeParse({
      name: "Anna Bianchi",
      email: "anna@test.com",
      phone: "3339876543",
      message: "Vorrei visitare l'immobile",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = buyerLeadSchema.safeParse({
      email: "anna@test.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = buyerLeadSchema.safeParse({
      name: "Anna",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  propertySchema                                                     */
/* ------------------------------------------------------------------ */

describe("propertySchema", () => {
  const validProperty = {
    type: "APPARTAMENTO" as const,
    price: 150000,
    surface: 85,
    rooms: 3,
    address: "Via Roma 15",
    city: "Torino",
    province: "TO",
    cap: "10100",
    lat: 45.07,
    lng: 7.68,
  };

  it("accepts a valid property", () => {
    const result = propertySchema.safeParse(validProperty);
    expect(result.success).toBe(true);
  });

  it("rejects price below 1000", () => {
    const result = propertySchema.safeParse({ ...validProperty, price: 500 });
    expect(result.success).toBe(false);
  });

  it("rejects surface below 1", () => {
    const result = propertySchema.safeParse({ ...validProperty, surface: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid property type", () => {
    const result = propertySchema.safeParse({ ...validProperty, type: "CASTELLO" });
    expect(result.success).toBe(false);
  });

  it("rejects missing address", () => {
    const result = propertySchema.safeParse({ ...validProperty, address: "" });
    expect(result.success).toBe(false);
  });

  it("rejects CAP shorter than 5 chars", () => {
    const result = propertySchema.safeParse({ ...validProperty, cap: "101" });
    expect(result.success).toBe(false);
  });

  it("defaults boolean features to false", () => {
    const result = propertySchema.safeParse(validProperty);
    if (result.success) {
      expect(result.data.hasGarage).toBe(false);
      expect(result.data.hasGarden).toBe(false);
      expect(result.data.hasPool).toBe(false);
    }
  });
});

/* ------------------------------------------------------------------ */
/*  sellerLeadSchema                                                   */
/* ------------------------------------------------------------------ */

describe("sellerLeadSchema", () => {
  it("accepts valid seller lead", () => {
    const result = sellerLeadSchema.safeParse({
      name: "Marco Verdi",
      email: "marco@test.it",
      phone: "3341234567",
      city: "Milano",
      province: "MI",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing city", () => {
    const result = sellerLeadSchema.safeParse({
      name: "Marco",
      email: "marco@test.it",
      phone: "3341234567",
      province: "MI",
    });
    expect(result.success).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  agencyLeadSchema                                                   */
/* ------------------------------------------------------------------ */

describe("agencyLeadSchema", () => {
  it("accepts valid agency lead", () => {
    const result = agencyLeadSchema.safeParse({
      agencyName: "Immobiliare San Giorgio",
      contactName: "Federico Ferrero",
      email: "info@sangiorgioimmobiliare.it",
      phone: "0113456789",
      city: "Torino",
      province: "TO",
    });
    expect(result.success).toBe(true);
  });

  it("rejects more than 3 preferred zones", () => {
    const zones = Array.from({ length: 4 }, (_, i) => ({
      zoneId: `zone-${i}`,
      zoneName: `Zone ${i}`,
      zoneClass: "BASE",
    }));
    const result = agencyLeadSchema.safeParse({
      agencyName: "Test Agency",
      contactName: "Test",
      email: "test@test.com",
      phone: "12345678",
      city: "Roma",
      province: "RM",
      preferredZones: zones,
    });
    expect(result.success).toBe(false);
  });
});
