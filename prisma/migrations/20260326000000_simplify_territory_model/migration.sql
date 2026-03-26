-- Simplify territory model: 3 zone tiers (BASE, URBANA, PREMIUM)
-- Replaces old 4 zone classes and 5 agency plans with simplified model.
-- This is a destructive migration (early stage, no real data).

-- 1. Drop all territory assignments (no real agency subscriptions yet)
DELETE FROM "TerritoryAssignment";

-- 2. Update Agency plan values to BASE before changing enum
UPDATE "Agency" SET "plan" = 'BASE';

-- 3. Recreate AgencyPlan enum with new values
ALTER TABLE "TerritoryAssignment" ALTER COLUMN "plan" TYPE text USING "plan"::text;
ALTER TABLE "Agency" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Agency" ALTER COLUMN "plan" TYPE text USING "plan"::text;
DROP TYPE "AgencyPlan";
CREATE TYPE "AgencyPlan" AS ENUM ('BASE', 'URBANA', 'PREMIUM');
ALTER TABLE "Agency" ALTER COLUMN "plan" TYPE "AgencyPlan" USING 'BASE'::"AgencyPlan";
ALTER TABLE "Agency" ALTER COLUMN "plan" SET DEFAULT 'BASE'::"AgencyPlan";
ALTER TABLE "TerritoryAssignment" ALTER COLUMN "plan" TYPE "AgencyPlan" USING 'BASE'::"AgencyPlan";

-- 4. Recreate ZoneClass enum with new values
ALTER TABLE "Zone" ALTER COLUMN "zoneClass" TYPE text USING "zoneClass"::text;
DROP TYPE "ZoneClass";
CREATE TYPE "ZoneClass" AS ENUM ('BASE', 'URBANA', 'PREMIUM');
ALTER TABLE "Zone" ALTER COLUMN "zoneClass" TYPE "ZoneClass" USING 'BASE'::"ZoneClass";

-- 5. Drop old price and max columns from Zone
ALTER TABLE "Zone" DROP COLUMN IF EXISTS "priceBase";
ALTER TABLE "Zone" DROP COLUMN IF EXISTS "priceLocal";
ALTER TABLE "Zone" DROP COLUMN IF EXISTS "priceCity";
ALTER TABLE "Zone" DROP COLUMN IF EXISTS "pricePrime";
ALTER TABLE "Zone" DROP COLUMN IF EXISTS "priceElite";
ALTER TABLE "Zone" DROP COLUMN IF EXISTS "maxBase";
ALTER TABLE "Zone" DROP COLUMN IF EXISTS "maxLocal";
ALTER TABLE "Zone" DROP COLUMN IF EXISTS "maxCity";
ALTER TABLE "Zone" DROP COLUMN IF EXISTS "maxPrime";
ALTER TABLE "Zone" DROP COLUMN IF EXISTS "maxElite";

-- 6. Add new columns to Zone
ALTER TABLE "Zone" ADD COLUMN IF NOT EXISTS "avgPricePerSqm" DOUBLE PRECISION;
ALTER TABLE "Zone" ADD COLUMN IF NOT EXISTS "monthlyPrice" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Zone" ADD COLUMN IF NOT EXISTS "maxAgencies" INTEGER NOT NULL DEFAULT 4;
ALTER TABLE "Zone" ADD COLUMN IF NOT EXISTS "adjacentZoneIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
