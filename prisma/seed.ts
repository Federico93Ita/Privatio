import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@privatio.it" },
    update: {},
    create: {
      email: "admin@privatio.it",
      name: "Admin Privatio",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // Create test seller
  const sellerPassword = await hash("Seller123!", 12);
  const seller = await prisma.user.upsert({
    where: { email: "venditore@test.it" },
    update: {},
    create: {
      email: "venditore@test.it",
      name: "Marco Rossi",
      phone: "+39 333 1234567",
      password: sellerPassword,
      role: "SELLER",
      emailVerified: new Date(),
    },
  });
  console.log(`Seller user created: ${seller.email}`);

  // Create test buyer
  const buyerPassword = await hash("Buyer123!", 12);
  const buyer = await prisma.user.upsert({
    where: { email: "acquirente@test.it" },
    update: {},
    create: {
      email: "acquirente@test.it",
      name: "Laura Bianchi",
      phone: "+39 339 7654321",
      password: buyerPassword,
      role: "BUYER",
      emailVerified: new Date(),
    },
  });
  console.log(`Buyer user created: ${buyer.email}`);

  // Create test agency
  const agency = await prisma.agency.upsert({
    where: { email: "info@immobiliaresangiorgio.it" },
    update: {},
    create: {
      name: "Immobiliare San Giorgio",
      email: "info@immobiliaresangiorgio.it",
      phone: "+39 02 1234567",
      address: "Via Roma 15",
      city: "Milano",
      province: "MI",
      lat: 45.4642,
      lng: 9.19,
      coverageRadius: 20,
      plan: "PRO",
      isActive: true,
      description: "Agenzia immobiliare leader nel mercato milanese dal 1985.",
      rating: 4.5,
      reviewCount: 12,
    },
  });
  console.log(`Agency created: ${agency.name}`);

  // Create agency admin user
  const agencyAdminPassword = await hash("Agency123!", 12);
  const agencyAdmin = await prisma.user.upsert({
    where: { email: "admin@immobiliaresangiorgio.it" },
    update: {},
    create: {
      email: "admin@immobiliaresangiorgio.it",
      name: "Giuseppe Verdi",
      phone: "+39 02 1234567",
      password: agencyAdminPassword,
      role: "AGENCY_ADMIN",
      emailVerified: new Date(),
      agencyId: agency.id,
    },
  });
  console.log(`Agency admin created: ${agencyAdmin.email}`);

  // Create a sample property
  const property = await prisma.property.upsert({
    where: { slug: "appartamento-luminoso-milano-centro" },
    update: {},
    create: {
      slug: "appartamento-luminoso-milano-centro",
      title: "Appartamento luminoso in zona Centro",
      description:
        "Splendido appartamento di 95 mq in pieno centro a Milano, completamente ristrutturato. L'immobile si trova al terzo piano di un elegante palazzo d'epoca con ascensore. Composto da ingresso, ampio soggiorno con cucina a vista, due camere da letto matrimoniali, bagno con doccia e vasca, e un comodo ripostiglio. Pavimenti in parquet originale, soffitti alti con stucchi decorativi. Riscaldamento centralizzato, aria condizionata. Cantina di pertinenza.",
      type: "APPARTAMENTO",
      status: "PUBLISHED",
      price: 385000,
      surface: 95,
      rooms: 4,
      bathrooms: 1,
      floor: 3,
      totalFloors: 5,
      hasGarage: false,
      hasGarden: false,
      hasBalcony: true,
      hasElevator: true,
      energyClass: "D",
      yearBuilt: 1920,
      address: "Via Montenapoleone 10",
      city: "Milano",
      province: "MI",
      cap: "20121",
      lat: 45.4685,
      lng: 9.1954,
      sellerId: seller.id,
      publishedAt: new Date(),
      viewCount: 42,
    },
  });
  console.log(`Property created: ${property.title}`);

  // Create a second property
  const property2 = await prisma.property.upsert({
    where: { slug: "villa-con-giardino-monza" },
    update: {},
    create: {
      slug: "villa-con-giardino-monza",
      title: "Villa con giardino a Monza",
      description:
        "Elegante villa indipendente di 250 mq con ampio giardino privato di 500 mq. L'immobile dispone di tre livelli: al piano terra soggiorno doppio, cucina abitabile, studio e bagno ospiti; al primo piano tre camere da letto con due bagni; al piano seminterrato taverna, lavanderia e box doppio. Completamente ristrutturata nel 2018 con materiali di pregio. Impianto fotovoltaico, riscaldamento a pavimento.",
      type: "VILLA",
      status: "PUBLISHED",
      price: 720000,
      surface: 250,
      rooms: 7,
      bathrooms: 3,
      floor: 0,
      totalFloors: 2,
      hasGarage: true,
      hasGarden: true,
      hasBalcony: true,
      hasElevator: false,
      energyClass: "B",
      yearBuilt: 1995,
      address: "Via Boccaccio 22",
      city: "Monza",
      province: "MB",
      cap: "20900",
      lat: 45.5845,
      lng: 9.2744,
      sellerId: seller.id,
      publishedAt: new Date(),
      viewCount: 28,
    },
  });
  console.log(`Property created: ${property2.title}`);

  // Assign property to agency
  await prisma.propertyAssignment.upsert({
    where: { propertyId: property.id },
    update: {},
    create: {
      propertyId: property.id,
      agencyId: agency.id,
      status: "ACTIVE",
    },
  });
  console.log("Property assigned to agency");

  // Create sample seller lead
  await prisma.sellerLead.create({
    data: {
      name: "Anna Colombo",
      email: "anna.colombo@email.it",
      phone: "+39 345 9876543",
      city: "Roma",
      province: "RM",
      propertyType: "APPARTAMENTO",
      estimatedValue: 280000,
      status: "NEW",
    },
  });
  console.log("Sample seller lead created");

  // Create sample agency lead
  await prisma.agencyLead.create({
    data: {
      agencyName: "Casa & Co Immobiliare",
      contactName: "Roberto Neri",
      email: "roberto@casaeco.it",
      phone: "+39 06 5551234",
      city: "Roma",
      province: "RM",
      agentCount: 5,
      message: "Siamo interessati a diventare partner Privatio per la zona Roma Sud.",
      status: "NEW",
    },
  });
  console.log("Sample agency lead created");

  console.log("\nSeed completed successfully!");
  console.log("\n--- Test Credentials ---");
  console.log("Admin:    admin@privatio.it / Admin123!");
  console.log("Seller:   venditore@test.it / Seller123!");
  console.log("Buyer:    acquirente@test.it / Buyer123!");
  console.log("Agency:   admin@immobiliaresangiorgio.it / Agency123!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
