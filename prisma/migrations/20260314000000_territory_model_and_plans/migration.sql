-- CreateEnum ZoneClass
CREATE TYPE "ZoneClass" AS ENUM ('CLUSTER_LOCAL', 'COMUNE', 'MACROQUARTIERE', 'MICROZONA_PRIME');

-- Migrate AgencyPlan enum: BASE/PRO → BASE/PREMIER_LOCAL/PREMIER_CITY/PREMIER_PRIME/PREMIER_ELITE
-- 1. Create new enum
CREATE TYPE "AgencyPlan_new" AS ENUM ('BASE', 'PREMIER_LOCAL', 'PREMIER_CITY', 'PREMIER_PRIME', 'PREMIER_ELITE');

-- 2. Drop default, convert column, map PRO → PREMIER_LOCAL, re-add default
ALTER TABLE "Agency" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Agency" ALTER COLUMN "plan" TYPE TEXT;
UPDATE "Agency" SET "plan" = 'PREMIER_LOCAL' WHERE "plan" = 'PRO';
ALTER TABLE "Agency" ALTER COLUMN "plan" TYPE "AgencyPlan_new" USING "plan"::"AgencyPlan_new";
ALTER TABLE "Agency" ALTER COLUMN "plan" SET DEFAULT 'BASE'::"AgencyPlan_new";

-- 3. Drop old enum and rename new
DROP TYPE "AgencyPlan";
ALTER TYPE "AgencyPlan_new" RENAME TO "AgencyPlan";

-- Make coverageRadius optional (remove default)
ALTER TABLE "Agency" ALTER COLUMN "coverageRadius" DROP NOT NULL;
ALTER TABLE "Agency" ALTER COLUMN "coverageRadius" DROP DEFAULT;

-- CreateTable Zone
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "zoneClass" "ZoneClass" NOT NULL,
    "region" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT,
    "capCodes" TEXT[],
    "municipalities" TEXT[],
    "population" INTEGER NOT NULL DEFAULT 0,
    "ntn" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marketScore" INTEGER NOT NULL DEFAULT 1,
    "priceBase" INTEGER,
    "priceLocal" INTEGER,
    "priceCity" INTEGER,
    "pricePrime" INTEGER,
    "priceElite" INTEGER,
    "maxBase" INTEGER NOT NULL DEFAULT 0,
    "maxLocal" INTEGER NOT NULL DEFAULT 0,
    "maxCity" INTEGER NOT NULL DEFAULT 0,
    "maxPrime" INTEGER NOT NULL DEFAULT 0,
    "maxElite" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable TerritoryAssignment
CREATE TABLE "TerritoryAssignment" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "plan" "AgencyPlan" NOT NULL,
    "monthlyPrice" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripeItemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TerritoryAssignment_pkey" PRIMARY KEY ("id")
);

-- Add zoneId to Property
ALTER TABLE "Property" ADD COLUMN "zoneId" TEXT;

-- CreateIndex Zone
CREATE UNIQUE INDEX "Zone_slug_key" ON "Zone"("slug");
CREATE INDEX "Zone_province_idx" ON "Zone"("province");
CREATE INDEX "Zone_region_idx" ON "Zone"("region");
CREATE INDEX "Zone_zoneClass_idx" ON "Zone"("zoneClass");

-- CreateIndex TerritoryAssignment
CREATE UNIQUE INDEX "TerritoryAssignment_agencyId_zoneId_key" ON "TerritoryAssignment"("agencyId", "zoneId");
CREATE INDEX "TerritoryAssignment_zoneId_isActive_idx" ON "TerritoryAssignment"("zoneId", "isActive");
CREATE INDEX "TerritoryAssignment_agencyId_isActive_idx" ON "TerritoryAssignment"("agencyId", "isActive");

-- CreateIndex Property zoneId
CREATE INDEX "Property_zoneId_idx" ON "Property"("zoneId");

-- AddForeignKey TerritoryAssignment → Agency
ALTER TABLE "TerritoryAssignment" ADD CONSTRAINT "TerritoryAssignment_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey TerritoryAssignment → Zone
ALTER TABLE "TerritoryAssignment" ADD CONSTRAINT "TerritoryAssignment_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey Property → Zone
ALTER TABLE "Property" ADD CONSTRAINT "Property_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
