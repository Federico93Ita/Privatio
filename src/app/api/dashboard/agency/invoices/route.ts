import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { generateInvoicePDF } from "@/lib/invoice-pdf";
import type { InvoiceData } from "@/lib/invoice-pdf";

/**
 * GET /api/dashboard/agency/invoices — List invoices from Stripe
 * GET /api/dashboard/agency/invoices?download=<invoice_id> — Download PDF
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { agencyId: true },
  });

  if (!user?.agencyId) {
    return NextResponse.json({ error: "Agenzia non trovata" }, { status: 403 });
  }

  const agency = await prisma.agency.findUnique({
    where: { id: user.agencyId },
  });

  if (!agency?.stripeCustomerId) {
    return NextResponse.json({ invoices: [] });
  }

  const { searchParams } = new URL(req.url);
  const downloadId = searchParams.get("download");

  // ---- Download single invoice as PDF ----
  if (downloadId) {
    try {
      const stripeInvoice = await stripe.invoices.retrieve(downloadId);

      // Verify this invoice belongs to this agency
      if (stripeInvoice.customer !== agency.stripeCustomerId) {
        return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
      }

      const invoiceData: InvoiceData = {
        invoiceNumber: stripeInvoice.number || stripeInvoice.id,
        invoiceDate: new Date((stripeInvoice.created || 0) * 1000).toLocaleDateString("it-IT"),
        dueDate: stripeInvoice.due_date
          ? new Date(stripeInvoice.due_date * 1000).toLocaleDateString("it-IT")
          : undefined,

        // Emittente
        companyName: "Privatio S.r.l.",
        companyAddress: "Via Roma 1, 10100 Torino (TO)",
        companyVat: process.env.PRIVATIO_VAT || "IT00000000000",
        companyPec: process.env.PRIVATIO_PEC || "privatio@pec.it",
        companySdi: process.env.PRIVATIO_SDI || "0000000",

        // Cliente
        clientName: agency.ragioneSociale || agency.name,
        clientAddress: [
          agency.invoiceAddress,
          agency.invoiceCity && agency.invoiceProvince
            ? `${agency.invoiceCap || ""} ${agency.invoiceCity} (${agency.invoiceProvince})`
            : agency.city,
        ]
          .filter(Boolean)
          .join(", "),
        clientVat: agency.partitaIva || "",
        clientCf: agency.codiceFiscale || "",
        clientPec: agency.pec || agency.email,
        clientSdi: agency.codiceSdi || undefined,

        // Items from Stripe invoice lines
        items: (stripeInvoice.lines?.data || []).map((line) => ({
          description: line.description || "Abbonamento territorio Privatio",
          quantity: line.quantity || 1,
          unitPrice: (line.amount || 0) / 100, // cents → EUR
          vatRate: 22, // IVA standard italiana
        })),

        paymentMethod: "Carta di credito (Stripe)",
        paymentDate: stripeInvoice.status_transitions?.paid_at
          ? new Date(stripeInvoice.status_transitions.paid_at * 1000).toLocaleDateString("it-IT")
          : undefined,
        stripeInvoiceId: stripeInvoice.id,
      };

      // Fallback if no items
      if (invoiceData.items.length === 0) {
        invoiceData.items = [
          {
            description: "Abbonamento territorio Privatio",
            quantity: 1,
            unitPrice: (stripeInvoice.amount_paid || 0) / 100,
            vatRate: 22,
          },
        ];
      }

      const pdfDataUri = generateInvoicePDF(invoiceData);

      return NextResponse.json({ pdf: pdfDataUri, invoiceNumber: invoiceData.invoiceNumber });
    } catch (error) {
      console.error("Invoice download error:", error);
      return NextResponse.json({ error: "Errore nel download della fattura" }, { status: 500 });
    }
  }

  // ---- List invoices ----
  try {
    const stripeInvoices = await stripe.invoices.list({
      customer: agency.stripeCustomerId,
      limit: 24, // Last 2 years monthly
      status: "paid",
    });

    const invoices = stripeInvoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number || inv.id,
      date: new Date((inv.created || 0) * 1000).toISOString(),
      amount: (inv.amount_paid || 0) / 100,
      status: inv.status,
      pdfUrl: inv.invoice_pdf || null,
    }));

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Invoice list error:", error);
    return NextResponse.json({ error: "Errore nel caricamento fatture" }, { status: 500 });
  }
}
