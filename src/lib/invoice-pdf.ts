import jsPDF from "jspdf";

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;

  // Emittente (Privatio)
  companyName: string;
  companyAddress: string;
  companyVat: string;
  companyPec: string;
  companySdi: string;

  // Cliente (Agenzia)
  clientName: string;
  clientAddress: string;
  clientVat: string;
  clientCf: string;
  clientPec: string;
  clientSdi?: string;

  // Righe fattura
  items: {
    description: string;
    quantity: number;
    unitPrice: number; // in EUR (not cents)
    vatRate: number; // e.g., 22
  }[];

  // Pagamento
  paymentMethod: string;
  paymentDate?: string;
  stripeInvoiceId?: string;
}

/**
 * Generates a professional Italian invoice as a PDF buffer.
 * Returns a base64-encoded PDF string.
 */
export function generateInvoicePDF(data: InvoiceData): string {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // ---- Header ----
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("FATTURA", margin, y);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`N. ${data.invoiceNumber}`, pageWidth - margin, y, { align: "right" });
  y += 6;
  doc.text(`Data: ${data.invoiceDate}`, pageWidth - margin, y, { align: "right" });
  if (data.dueDate) {
    y += 5;
    doc.text(`Scadenza: ${data.dueDate}`, pageWidth - margin, y, { align: "right" });
  }

  y += 12;

  // ---- Separator ----
  doc.setDrawColor(59, 130, 246); // Blue
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ---- Emittente & Cliente side by side ----
  const colWidth = (pageWidth - 2 * margin - 10) / 2;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100);
  doc.text("EMITTENTE", margin, y);
  doc.text("CLIENTE", margin + colWidth + 10, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.setFontSize(9);

  const emittente = [
    data.companyName,
    data.companyAddress,
    `P.IVA: ${data.companyVat}`,
    `PEC: ${data.companyPec}`,
    `SDI: ${data.companySdi}`,
  ];

  const cliente = [
    data.clientName,
    data.clientAddress,
    `P.IVA: ${data.clientVat}`,
    `C.F.: ${data.clientCf}`,
    `PEC: ${data.clientPec}`,
    ...(data.clientSdi ? [`SDI: ${data.clientSdi}`] : []),
  ];

  const maxLines = Math.max(emittente.length, cliente.length);
  for (let i = 0; i < maxLines; i++) {
    if (emittente[i]) doc.text(emittente[i], margin, y);
    if (cliente[i]) doc.text(cliente[i], margin + colWidth + 10, y);
    y += 5;
  }

  y += 8;

  // ---- Table Header ----
  doc.setFillColor(245, 247, 250);
  doc.rect(margin, y - 4, pageWidth - 2 * margin, 8, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80);
  doc.text("DESCRIZIONE", margin + 2, y);
  doc.text("QTÀ", margin + colWidth, y, { align: "right" });
  doc.text("PREZZO UNIT.", margin + colWidth + 25, y, { align: "right" });
  doc.text("IVA %", margin + colWidth + 45, y, { align: "right" });
  doc.text("TOTALE", pageWidth - margin - 2, y, { align: "right" });
  y += 8;

  // ---- Table Rows ----
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.setFontSize(9);

  let subtotal = 0;
  let totalVat = 0;

  for (const item of data.items) {
    const lineTotal = item.quantity * item.unitPrice;
    const lineVat = lineTotal * (item.vatRate / 100);
    subtotal += lineTotal;
    totalVat += lineVat;

    doc.text(item.description, margin + 2, y, { maxWidth: colWidth - 10 });
    doc.text(String(item.quantity), margin + colWidth, y, { align: "right" });
    doc.text(formatEur(item.unitPrice), margin + colWidth + 25, y, { align: "right" });
    doc.text(`${item.vatRate}%`, margin + colWidth + 45, y, { align: "right" });
    doc.text(formatEur(lineTotal), pageWidth - margin - 2, y, { align: "right" });
    y += 7;
  }

  // ---- Separator ----
  y += 2;
  doc.setDrawColor(220);
  doc.setLineWidth(0.3);
  doc.line(margin + colWidth, y, pageWidth - margin, y);
  y += 8;

  // ---- Totals ----
  const totalsX = margin + colWidth + 20;
  doc.setFontSize(9);

  doc.text("Imponibile:", totalsX, y);
  doc.text(formatEur(subtotal), pageWidth - margin - 2, y, { align: "right" });
  y += 6;

  doc.text(`IVA (${data.items[0]?.vatRate || 22}%)`, totalsX, y);
  doc.text(formatEur(totalVat), pageWidth - margin - 2, y, { align: "right" });
  y += 6;

  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(totalsX, y, pageWidth - margin, y);
  y += 7;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TOTALE:", totalsX, y);
  doc.text(formatEur(subtotal + totalVat), pageWidth - margin - 2, y, { align: "right" });
  y += 14;

  // ---- Payment Info ----
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100);
  doc.text("INFORMAZIONI PAGAMENTO", margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.setFontSize(9);
  doc.text(`Metodo: ${data.paymentMethod}`, margin, y);
  y += 5;
  if (data.paymentDate) {
    doc.text(`Data pagamento: ${data.paymentDate}`, margin, y);
    y += 5;
  }
  if (data.stripeInvoiceId) {
    doc.text(`Rif. Stripe: ${data.stripeInvoiceId}`, margin, y);
  }

  // ---- Footer ----
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text(
    "Documento generato automaticamente da Privatio — www.privatio.it",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  return doc.output("datauristring");
}

function formatEur(amount: number): string {
  return `€ ${amount.toFixed(2).replace(".", ",")}`;
}
