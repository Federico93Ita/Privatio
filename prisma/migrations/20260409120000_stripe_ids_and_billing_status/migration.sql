-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'UNPAID', 'CANCELED');

-- AlterTable Agency
ALTER TABLE "Agency" ADD COLUMN "billingStatus" "BillingStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable Zone
ALTER TABLE "Zone" ADD COLUMN "stripeProductId" TEXT;
ALTER TABLE "Zone" ADD COLUMN "stripePriceId" TEXT;

-- CreateTable StripeEventLog
CREATE TABLE "StripeEventLog" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StripeEventLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StripeEventLog_eventId_key" ON "StripeEventLog"("eventId");
CREATE INDEX "StripeEventLog_type_idx" ON "StripeEventLog"("type");
CREATE INDEX "StripeEventLog_createdAt_idx" ON "StripeEventLog"("createdAt");
