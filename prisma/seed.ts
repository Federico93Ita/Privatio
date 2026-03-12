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

  // Additional properties to make the platform look alive
  const extraProperties = [
    {
      slug: "attico-panoramico-roma-prati",
      title: "Attico panoramico a Roma Prati",
      description: "Splendido attico di 140 mq con terrazza panoramica di 60 mq con vista su San Pietro. Doppio soggiorno, cucina separata, tre camere, due bagni. Finiture di pregio, parquet in rovere, domotica. Box auto doppio.",
      type: "ATTICO" as const,
      price: 890000,
      surface: 140,
      rooms: 5,
      bathrooms: 2,
      floor: 6,
      totalFloors: 6,
      hasGarage: true,
      hasGarden: false,
      hasBalcony: true,
      hasElevator: true,
      energyClass: "A2",
      yearBuilt: 2010,
      address: "Via Cola di Rienzo 180",
      city: "Roma",
      province: "RM",
      cap: "00192",
      lat: 41.9109,
      lng: 12.4625,
      viewCount: 67,
    },
    {
      slug: "trilocale-ristrutturato-torino-crocetta",
      title: "Trilocale ristrutturato in Crocetta",
      description: "Appartamento completamente ristrutturato nel 2023, 75 mq. Soggiorno luminoso, cucina moderna, due camere, bagno con doccia. Parquet, infissi nuovi, caldaia a condensazione. Vicinissimo a metro e servizi.",
      type: "APPARTAMENTO" as const,
      price: 198000,
      surface: 75,
      rooms: 3,
      bathrooms: 1,
      floor: 2,
      totalFloors: 4,
      hasGarage: false,
      hasGarden: false,
      hasBalcony: true,
      hasElevator: false,
      energyClass: "C",
      yearBuilt: 1965,
      address: "Corso Galileo Ferraris 42",
      city: "Torino",
      province: "TO",
      cap: "10129",
      lat: 45.0579,
      lng: 7.6661,
      viewCount: 35,
    },
    {
      slug: "casa-indipendente-firenze-collina",
      title: "Casa indipendente sulle colline fiorentine",
      description: "Caratteristica casa colonica ristrutturata di 180 mq su due livelli con giardino di 1000 mq e vista panoramica su Firenze. Travi a vista, cotto originale, camino. Tre camere, due bagni, taverna. Piscina fuori terra.",
      type: "CASA_INDIPENDENTE" as const,
      price: 520000,
      surface: 180,
      rooms: 6,
      bathrooms: 2,
      floor: 0,
      totalFloors: 1,
      hasGarage: true,
      hasGarden: true,
      hasBalcony: false,
      hasElevator: false,
      energyClass: "E",
      yearBuilt: 1800,
      address: "Via delle Colline 8",
      city: "Firenze",
      province: "FI",
      cap: "50125",
      lat: 43.7559,
      lng: 11.2345,
      viewCount: 51,
    },
    {
      slug: "bilocale-moderno-bologna-centro",
      title: "Bilocale moderno in centro a Bologna",
      description: "Grazioso bilocale di 55 mq al primo piano, recentemente rinnovato. Open space con angolo cottura, camera matrimoniale, bagno con doccia. Ideale come prima casa o investimento. A due passi da Piazza Maggiore.",
      type: "APPARTAMENTO" as const,
      price: 165000,
      surface: 55,
      rooms: 2,
      bathrooms: 1,
      floor: 1,
      totalFloors: 3,
      hasGarage: false,
      hasGarden: false,
      hasBalcony: true,
      hasElevator: false,
      energyClass: "D",
      yearBuilt: 1950,
      address: "Via Ugo Bassi 25",
      city: "Bologna",
      province: "BO",
      cap: "40121",
      lat: 44.4939,
      lng: 11.3387,
      viewCount: 22,
    },
    {
      slug: "villa-moderna-lago-como",
      title: "Villa moderna con vista lago a Como",
      description: "Esclusiva villa di nuova costruzione di 320 mq con vista mozzafiato sul Lago di Como. Design contemporaneo, ampie vetrate, giardino terrazzato con piscina infinity. Quattro camere, quattro bagni, spa privata, domotica completa. Garage triplo.",
      type: "VILLA" as const,
      price: 1850000,
      surface: 320,
      rooms: 8,
      bathrooms: 4,
      floor: 0,
      totalFloors: 2,
      hasGarage: true,
      hasGarden: true,
      hasBalcony: true,
      hasElevator: true,
      energyClass: "A4",
      yearBuilt: 2024,
      address: "Via Panoramica 5",
      city: "Cernobbio",
      province: "CO",
      cap: "22012",
      lat: 45.8469,
      lng: 9.0797,
      viewCount: 94,
    },
    {
      slug: "loft-industriale-milano-navigli",
      title: "Loft industriale sui Navigli",
      description: "Spettacolare loft di 110 mq ricavato da ex opificio. Doppia altezza con soppalco, travi in ferro originali, mattoni a vista. Open space con cucina isola, camera soppalcata, bagno design. Cortile condominiale.",
      type: "LOFT" as const,
      price: 430000,
      surface: 110,
      rooms: 2,
      bathrooms: 1,
      floor: 0,
      totalFloors: 1,
      hasGarage: false,
      hasGarden: false,
      hasBalcony: false,
      hasElevator: false,
      energyClass: "C",
      yearBuilt: 1930,
      address: "Alzaia Naviglio Grande 44",
      city: "Milano",
      province: "MI",
      cap: "20144",
      lat: 45.4498,
      lng: 9.1673,
      viewCount: 58,
    },
    {
      slug: "mansarda-elegante-napoli-vomero",
      title: "Mansarda elegante al Vomero",
      description: "Affascinante mansarda di 85 mq al sesto piano con ascensore. Travi in legno a vista, lucernari Velux. Soggiorno con angolo studio, cucina abitabile, camera matrimoniale, cameretta, bagno. Vista su Napoli e Vesuvio.",
      type: "MANSARDA" as const,
      price: 245000,
      surface: 85,
      rooms: 4,
      bathrooms: 1,
      floor: 6,
      totalFloors: 6,
      hasGarage: false,
      hasGarden: false,
      hasBalcony: true,
      hasElevator: true,
      energyClass: "D",
      yearBuilt: 1975,
      address: "Via Scarlatti 120",
      city: "Napoli",
      province: "NA",
      cap: "80129",
      lat: 40.8478,
      lng: 14.2335,
      viewCount: 31,
    },
    {
      slug: "quadrilocale-luminoso-padova",
      title: "Quadrilocale luminoso a Padova",
      description: "Ampio quadrilocale di 120 mq in zona residenziale tranquilla. Soggiorno doppio, cucina separata, tre camere, due bagni, ripostiglio. Garage singolo e cantina. Giardino condominiale. Ottimo per famiglie.",
      type: "APPARTAMENTO" as const,
      price: 275000,
      surface: 120,
      rooms: 5,
      bathrooms: 2,
      floor: 2,
      totalFloors: 3,
      hasGarage: true,
      hasGarden: false,
      hasBalcony: true,
      hasElevator: true,
      energyClass: "C",
      yearBuilt: 2005,
      address: "Via Euganea 88",
      city: "Padova",
      province: "PD",
      cap: "35136",
      lat: 45.3985,
      lng: 11.8621,
      viewCount: 18,
    },
  ];

  for (const prop of extraProperties) {
    const created = await prisma.property.upsert({
      where: { slug: prop.slug },
      update: {},
      create: {
        ...prop,
        status: "PUBLISHED",
        sellerId: seller.id,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // random date in last 30 days
      },
    });
    console.log(`Property created: ${created.title}`);
  }

  // Create second agency
  const agency2 = await prisma.agency.upsert({
    where: { email: "info@casaroma.it" },
    update: {},
    create: {
      name: "Casa Roma Immobiliare",
      email: "info@casaroma.it",
      phone: "+39 06 9876543",
      address: "Via Condotti 55",
      city: "Roma",
      province: "RM",
      lat: 41.9054,
      lng: 12.4801,
      coverageRadius: 25,
      plan: "BASE",
      isActive: true,
      description: "Specializzati nella vendita di immobili di pregio nel centro di Roma.",
      rating: 4.2,
      reviewCount: 8,
    },
  });
  console.log(`Agency created: ${agency2.name}`);

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

  // Create sample buyer leads for the main property (for seller dashboard)
  const buyerLeadsData = [
    {
      propertyId: property.id,
      name: "Laura Bianchi",
      email: "laura.bianchi@email.it",
      phone: "+39 339 7654321",
      message: "Buongiorno, sarei interessata a visionare l'appartamento. È possibile fissare una visita nel weekend?",
    },
    {
      propertyId: property.id,
      name: "Roberto Ferrara",
      email: "r.ferrara@gmail.com",
      phone: "+39 347 2223344",
      message: "Vorrei sapere se il prezzo è trattabile e se ci sono spese condominiali.",
    },
    {
      propertyId: property.id,
      name: "Giulia Martinelli",
      email: "giulia.mart@outlook.it",
      phone: "+39 328 5551234",
      message: "Sono molto interessata. Potrebbe inviarmi la planimetria e le spese annuali?",
    },
    {
      propertyId: property.id,
      name: "Alessandro Conti",
      email: "a.conti@pec.it",
      phone: "+39 366 9998877",
      message: "Buonasera, l'immobile è ancora disponibile? Vorrei organizzare una visita.",
    },
  ];

  for (const lead of buyerLeadsData) {
    await prisma.buyerLead.create({
      data: {
        ...lead,
        createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000), // random in last 14 days
      },
    });
  }
  console.log(`${buyerLeadsData.length} buyer leads created`);

  // Create sample visits for the main property (for seller dashboard)
  const visitsData = [
    {
      propertyId: property.id,
      buyerName: "Laura Bianchi",
      buyerEmail: "laura.bianchi@email.it",
      buyerPhone: "+39 339 7654321",
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      status: "CONFIRMED" as const,
      notes: "Visita confermata per sabato mattina alle 10:00",
    },
    {
      propertyId: property.id,
      buyerName: "Alessandro Conti",
      buyerEmail: "a.conti@pec.it",
      buyerPhone: "+39 366 9998877",
      scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: "PENDING" as const,
      notes: null,
    },
    {
      propertyId: property.id,
      buyerName: "Giulia Martinelli",
      buyerEmail: "giulia.mart@outlook.it",
      buyerPhone: "+39 328 5551234",
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: "PENDING" as const,
      notes: "Preferisce orario pomeridiano",
    },
  ];

  for (const visit of visitsData) {
    await prisma.visit.create({ data: visit });
  }
  console.log(`${visitsData.length} visits created`);

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
