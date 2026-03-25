import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/agency/invoice
 *
 * Generates a printable HTML invoice for the agency's current subscription.
 * The user can use browser print (Ctrl+P) to save as PDF.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["AGENCY_ADMIN", "AGENCY_AGENT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const agency = await prisma.agency.findFirst({
    where: {
      agents: { some: { id: session.user.id } },
    },
    include: {
      territories: {
        where: { isActive: true },
        include: { zone: { select: { name: true } } },
      },
    },
  });

  if (!agency) {
    return NextResponse.json({ error: "Agenzia non trovata" }, { status: 404 });
  }

  if (!agency.stripeSubId) {
    return NextResponse.json({ error: "Nessun abbonamento attivo" }, { status: 404 });
  }

  const now = new Date();
  const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${agency.id.slice(-6).toUpperCase()}`;

  const planLabels: Record<string, string> = {
    BASE: "Piano Base",
    PREMIER_LOCAL: "Piano Premier Local",
    PREMIER_CITY: "Piano Premier City",
    PREMIER_PRIME: "Piano Premier Prime",
    PREMIER_ELITE: "Piano Premier Elite",
  };
  const planLabel = planLabels[agency.plan] || agency.plan;

  // Build territory rows
  const territoryRows = agency.territories
    .map(
      (t) =>
        `<tr>
          <td>${planLabel} — Zona: ${esc(t.zone.name)}</td>
          <td>Mensile</td>
          <td style="text-align: right;">${fmt(t.monthlyPrice)}</td>
        </tr>`
    )
    .join("");

  const total = agency.territories.reduce((sum, t) => sum + t.monthlyPrice, 0);

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <title>Fattura ${invoiceNumber} — Privatio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; }
    .logo { font-size: 28px; font-weight: 700; color: #0f172a; }
    .invoice-meta { text-align: right; font-size: 14px; color: #64748b; }
    .invoice-meta h2 { font-size: 24px; color: #0f172a; margin-bottom: 8px; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .party { font-size: 14px; line-height: 1.6; }
    .party h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    th { background: #f8fafc; text-align: left; padding: 12px 16px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 2px solid #e2e8f0; }
    td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    .total-row td { font-weight: 700; font-size: 16px; border-top: 2px solid #0f172a; border-bottom: none; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
    .print-btn { position: fixed; bottom: 24px; right: 24px; background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
    .print-btn:hover { background: #1d4ed8; }
    @media print { .print-btn { display: none; } body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Privatio</div>
      <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Piattaforma di Vetrina Immobiliare</p>
    </div>
    <div class="invoice-meta">
      <h2>FATTURA</h2>
      <p><strong>N.</strong> ${invoiceNumber}</p>
      <p><strong>Data:</strong> ${now.toLocaleDateString("it-IT")}</p>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Emittente</h3>
      <p><strong>Privatio S.r.l.</strong></p>
      <p>Torino, Italia</p>
      <p>info@privatio.it</p>
    </div>
    <div class="party" style="text-align: right;">
      <h3>Destinatario</h3>
      <p><strong>${esc(agency.ragioneSociale || agency.name)}</strong></p>
      ${agency.invoiceAddress ? `<p>${esc(agency.invoiceAddress)}, ${esc(agency.invoiceCap || "")} ${esc(agency.invoiceCity || "")} (${esc(agency.invoiceProvince || "")})</p>` : `<p>${esc(agency.address)}, ${esc(agency.city)} (${esc(agency.province)})</p>`}
      ${agency.partitaIva ? `<p>P.IVA: ${esc(agency.partitaIva)}</p>` : ""}
      ${agency.codiceFiscale ? `<p>C.F.: ${esc(agency.codiceFiscale)}</p>` : ""}
      ${agency.pec ? `<p>PEC: ${esc(agency.pec)}</p>` : ""}
      ${agency.codiceSdi ? `<p>Codice SDI: ${esc(agency.codiceSdi)}</p>` : ""}
      <p>${esc(agency.email)}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Descrizione</th>
        <th>Periodo</th>
        <th style="text-align: right;">Importo (IVA escl.)</th>
      </tr>
    </thead>
    <tbody>
      ${territoryRows || `<tr><td>${planLabel} — Abbonamento piattaforma</td><td>Mensile</td><td style="text-align: right;">—</td></tr>`}
      <tr class="total-row">
        <td colspan="2">Totale (IVA escl.)</td>
        <td style="text-align: right;">${fmt(total)}</td>
      </tr>
    </tbody>
  </table>

  <p style="font-size: 13px; color: #64748b;">
    Pagamento gestito tramite Stripe. ID Abbonamento: ${agency.stripeSubId || "N/D"}
  </p>

  <div class="footer">
    <p>Privatio S.r.l. — Torino, Italia — info@privatio.it — privatio.it</p>
    <p style="margin-top: 4px;">Documento di cortesia. Per la fattura fiscale fare riferimento allo SDI.</p>
  </div>

  <button class="print-btn" onclick="window.print()">Stampa / Salva PDF</button>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fmt(cents: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
