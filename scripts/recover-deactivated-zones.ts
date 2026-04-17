/**
 * RECOVERY: riattiva le zone OMI che sono state disattivate erroneamente dal
 * cleanup finale di `import-zones-omi.ts` quando l'import si è interrotto a
 * metà (fermato dopo la provincia BN per timeout / ragioni esterne).
 *
 * Strategia: le 14 province già processate contengono solo zone re-importate
 * corrette, quindi vanno lasciate stare. Tutte le altre province avevano zone
 * OMI attive prima del run: quelle che sono ora isActive=false con fascia
 * non-null sono da riattivare.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PROCESSED = [
  "AG", "AL", "AN", "AO", "AP", "AQ", "AR", "AT",
  "AV", "BA", "BG", "BI", "BL", "BN",
];

async function main() {
  const toRecover = await prisma.zone.count({
    where: { fascia: { not: null }, isActive: false, province: { notIn: PROCESSED } },
  });
  const totalInactive = await prisma.zone.count({
    where: { fascia: { not: null }, isActive: false },
  });
  console.log(`Zone OMI disattivate totali: ${totalInactive}`);
  console.log(`Da riattivare (province non processate): ${toRecover}`);

  const res = await prisma.zone.updateMany({
    where: { fascia: { not: null }, isActive: false, province: { notIn: PROCESSED } },
    data: { isActive: true },
  });
  console.log(`Riattivate: ${res.count}`);

  const active = await prisma.zone.count({
    where: { fascia: { not: null }, isActive: true },
  });
  console.log(`Zone OMI attive ora: ${active}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
