import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const p = new PrismaClient();
  const email = "test-agenzia@privatio.local";
  const password = "Test1234!";
  const hash = await bcrypt.hash(password, 10);

  const existing = await p.agency.findUnique({ where: { email } });
  if (existing) {
    console.log("Agenzia già esistente:", existing.id);
  }

  const agency =
    existing ||
    (await p.agency.create({
      data: {
        name: "Agenzia Test Privatio",
        email,
        phone: "+390000000000",
        address: "Via Test 1",
        city: "Milano",
        province: "MI",
        lat: 45.4642,
        lng: 9.19,
        isActive: true,
        plan: "BASE",
      },
    }));

  const user = await p.user.upsert({
    where: { email },
    update: { agencyId: agency.id, role: "AGENCY_ADMIN", password: hash },
    create: {
      email,
      name: "Mario Rossi",
      password: hash,
      role: "AGENCY_ADMIN",
      agencyId: agency.id,
      emailVerified: new Date(),
    },
  });

  console.log("\n✅ Account agenzia test creato:");
  console.log("   URL:      http://localhost:3000/accedi");
  console.log("   Email:    " + email);
  console.log("   Password: " + password);
  console.log("   AgencyId: " + agency.id);
  console.log("   UserId:   " + user.id);
  await p.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
