-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('RECEIVED', 'IN_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LEAD_RECEIVED', 'PROPERTY_ASSIGNED', 'VISIT_SCHEDULED', 'VISIT_CONFIRMED', 'CONTRACT_SIGNED', 'PAYMENT_FAILED', 'TERRITORY_ACTIVATED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "EmailCategory" AS ENUM ('TRANSACTIONAL', 'MARKETING', 'ADMIN_NOTIFICATION');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'BOUNCED', 'COMPLAINED', 'FAILED');

-- DropForeignKey
ALTER TABLE "BuyerLead" DROP CONSTRAINT "BuyerLead_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "PropertyAssignment" DROP CONSTRAINT "PropertyAssignment_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "PropertyAssignment" DROP CONSTRAINT "PropertyAssignment_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "TerritoryAssignment" DROP CONSTRAINT "TerritoryAssignment_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "TerritoryAssignment" DROP CONSTRAINT "TerritoryAssignment_zoneId_fkey";

-- DropForeignKey
ALTER TABLE "Visit" DROP CONSTRAINT "Visit_propertyId_fkey";

-- AlterTable
ALTER TABLE "Agency" ADD COLUMN     "awards" TEXT[],
ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "foundedYear" INTEGER,
ADD COLUMN     "gallery" TEXT[],
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "profileCompletedAt" TIMESTAMP(3),
ADD COLUMN     "responseTimeHours" INTEGER,
ADD COLUMN     "serviceAreas" TEXT[],
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "specializations" TEXT[],
ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedBy" TEXT,
ADD COLUMN     "suspendedReason" TEXT,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "teamSize" INTEGER,
ADD COLUMN     "transactionsCount" INTEGER,
ADD COLUMN     "uniqueSellingPoints" TEXT[],
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "whatsappNumber" TEXT;

-- AlterTable
ALTER TABLE "AgencyLead" ADD COLUMN     "address" TEXT,
ADD COLUMN     "preferredZones" JSONB;

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "resolutionNote" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ComplaintStatus" NOT NULL DEFAULT 'RECEIVED';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "fallbackConsentAt" TIMESTAMP(3),
ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderatedBy" TEXT,
ADD COLUMN     "moderationNote" TEXT;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "hiddenAt" TIMESTAMP(3),
ADD COLUMN     "hiddenReason" TEXT,
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "clausoleApprovedAt" TIMESTAMP(3),
ADD COLUMN     "emailBounceCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "emailInvalid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fase2ConsentAt" TIMESTAMP(3),
ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedBy" TEXT,
ADD COLUMN     "suspendedReason" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;

-- AlterTable
ALTER TABLE "Zone" ADD COLUMN     "boundary" JSONB,
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ALTER COLUMN "adjacentZoneIds" DROP DEFAULT;

-- CreateTable
CREATE TABLE "PropertyFallbackContact" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyFallbackContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "resendId" TEXT,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "templateName" TEXT,
    "category" "EmailCategory" NOT NULL DEFAULT 'TRANSACTIONAL',
    "status" "EmailStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "metadata" JSONB,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "complainedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyFallbackContact_propertyId_idx" ON "PropertyFallbackContact"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyFallbackContact_agencyId_idx" ON "PropertyFallbackContact"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyFallbackContact_propertyId_agencyId_key" ON "PropertyFallbackContact"("propertyId", "agencyId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailLog_resendId_key" ON "EmailLog"("resendId");

-- CreateIndex
CREATE INDEX "EmailLog_to_idx" ON "EmailLog"("to");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- CreateIndex
CREATE INDEX "EmailLog_templateName_idx" ON "EmailLog"("templateName");

-- CreateIndex
CREATE INDEX "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_slug_key" ON "Agency"("slug");

-- CreateIndex
CREATE INDEX "Agency_stripeCustomerId_idx" ON "Agency"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Agency_status_idx" ON "Agency"("status");

-- CreateIndex
CREATE INDEX "BuyerLead_propertyId_idx" ON "BuyerLead"("propertyId");

-- CreateIndex
CREATE INDEX "BuyerLead_email_idx" ON "BuyerLead"("email");

-- CreateIndex
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");

-- CreateIndex
CREATE INDEX "Contract_expiresAt_idx" ON "Contract"("expiresAt");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "PropertyAssignment_agencyId_idx" ON "PropertyAssignment"("agencyId");

-- CreateIndex
CREATE INDEX "PropertyAssignment_status_idx" ON "PropertyAssignment"("status");

-- CreateIndex
CREATE INDEX "SellerLead_status_idx" ON "SellerLead"("status");

-- CreateIndex
CREATE INDEX "SellerLead_email_idx" ON "SellerLead"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_agencyId_idx" ON "User"("agencyId");

-- CreateIndex
CREATE INDEX "Visit_propertyId_idx" ON "Visit"("propertyId");

-- CreateIndex
CREATE INDEX "Visit_status_idx" ON "Visit"("status");

-- AddForeignKey
ALTER TABLE "PropertyFallbackContact" ADD CONSTRAINT "PropertyFallbackContact_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyFallbackContact" ADD CONSTRAINT "PropertyFallbackContact_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyAssignment" ADD CONSTRAINT "PropertyAssignment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyAssignment" ADD CONSTRAINT "PropertyAssignment_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerLead" ADD CONSTRAINT "BuyerLead_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryAssignment" ADD CONSTRAINT "TerritoryAssignment_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerritoryAssignment" ADD CONSTRAINT "TerritoryAssignment_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

