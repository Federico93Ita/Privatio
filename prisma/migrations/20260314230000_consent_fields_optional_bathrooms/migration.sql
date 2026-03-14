-- AlterTable: make bathrooms optional
ALTER TABLE "Property" ALTER COLUMN "bathrooms" DROP NOT NULL;

-- AlterTable: add consent tracking fields to User
ALTER TABLE "User" ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "privacyAcceptedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "marketingConsent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "termsVersion" TEXT;
ALTER TABLE "User" ADD COLUMN "termsAcceptedIp" TEXT;
