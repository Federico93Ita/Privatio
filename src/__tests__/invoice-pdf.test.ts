import { describe, it, expect } from "vitest";
import { generateInvoicePDF } from "@/lib/invoice-pdf";
import type { InvoiceData } from "@/lib/invoice-pdf";

describe("generateInvoicePDF", () => {
  const sampleInvoice: InvoiceData = {
    invoiceNumber: "2026-001",
    invoiceDate: "29/03/2026",
    companyName: "Privatio S.r.l.",
    companyAddress: "Via Roma 1, 10100 Torino",
    companyVat: "IT12345678901",
    companyPec: "privatio@pec.it",
    companySdi: "0000000",
    clientName: "Immobiliare Test S.r.l.",
    clientAddress: "Via Milano 5, 20100 Milano",
    clientVat: "IT98765432101",
    clientCf: "98765432101",
    clientPec: "test@pec.it",
    items: [
      {
        description: "Abbonamento territorio Torino Centro",
        quantity: 1,
        unitPrice: 49.0,
        vatRate: 22,
      },
    ],
    paymentMethod: "Carta di credito (Stripe)",
    paymentDate: "29/03/2026",
    stripeInvoiceId: "in_test_123",
  };

  it("generates a PDF as data URI string", () => {
    const result = generateInvoicePDF(sampleInvoice);
    expect(result).toBeTypeOf("string");
    expect(result).toContain("data:application/pdf");
  });

  it("generates PDF with multiple line items", () => {
    const multiItem = {
      ...sampleInvoice,
      items: [
        { description: "Zona Torino Centro", quantity: 1, unitPrice: 49, vatRate: 22 },
        { description: "Zona Torino Nord", quantity: 1, unitPrice: 39, vatRate: 22 },
      ],
    };
    const result = generateInvoicePDF(multiItem);
    expect(result).toContain("data:application/pdf");
  });

  it("handles zero-price items", () => {
    const freeItem = {
      ...sampleInvoice,
      items: [{ description: "Trial gratuito", quantity: 1, unitPrice: 0, vatRate: 22 }],
    };
    const result = generateInvoicePDF(freeItem);
    expect(result).toContain("data:application/pdf");
  });
});
