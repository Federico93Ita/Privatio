-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SELLER', 'BUYER', 'AGENCY_ADMIN', 'AGENCY_AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "AgencyPlan" AS ENUM ('BASE', 'PRO');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APPARTAMENTO', 'VILLA', 'CASA_INDIPENDENTE', 'ATTICO', 'MANSARDA', 'LOFT', 'TERRENO', 'NEGOZIO', 'UFFICIO');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'UNDER_CONTRACT', 'SOLD', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'ONBOARDING', 'CONVERTED', 'LOST');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'SELLER',
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agencyId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "coverageRadius" INTEGER NOT NULL DEFAULT 15,
    "plan" "AgencyPlan" NOT NULL DEFAULT 'BASE',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "stripeSubId" TEXT,
    "logoUrl" TEXT,
    "description" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "PropertyType" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "price" INTEGER NOT NULL,
    "surface" INTEGER NOT NULL,
    "rooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "hasGarage" BOOLEAN NOT NULL DEFAULT false,
    "hasGarden" BOOLEAN NOT NULL DEFAULT false,
    "hasBalcony" BOOLEAN NOT NULL DEFAULT false,
    "hasElevator" BOOLEAN NOT NULL DEFAULT false,
    "energyClass" TEXT,
    "yearBuilt" INTEGER,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "cap" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyPhoto" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "PropertyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyAssignment" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,

    CONSTRAINT "PropertyAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ESCLUSIVA_90_GIORNI',
    "duration" INTEGER NOT NULL DEFAULT 90,
    "signedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "sellerSigned" BOOLEAN NOT NULL DEFAULT false,
    "agencySigned" BOOLEAN NOT NULL DEFAULT false,
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "VisitStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerLead" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyerLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "propertyType" "PropertyType",
    "estimatedValue" INTEGER,
    "source" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyLead" (
    "id" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "agentCount" INTEGER,
    "message" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgencyLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'ALTRO',
    "propertyId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "userId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_email_key" ON "Agency"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");

-- CreateIndex
CREATE INDEX "Property_city_status_idx" ON "Property"("city", "status");

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "Property"("status");

-- CreateIndex
CREATE INDEX "Property_sellerId_idx" ON "Property"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyAssignment_propertyId_key" ON "PropertyAssignment"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_propertyId_key" ON "Contract"("propertyId");

-- CreateIndex
CREATE INDEX "Message_propertyId_createdAt_idx" ON "Message"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_receiverId_read_idx" ON "Message"("receiverId", "read");

-- CreateIndex
CREATE INDEX "Document_propertyId_idx" ON "Document"("propertyId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_propertyId_key" ON "Favorite"("userId", "propertyId");

-- CreateIndex
CREATE INDEX "SavedSearch_userId_idx" ON "SavedSearch"("userId");

-- CreateIndex
CREATE INDEX "Review_agencyId_idx" ON "Review"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_agencyId_key" ON "Review"("userId", "agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyPhoto" ADD CONSTRAINT "PropertyPhoto_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyAssignment" ADD CONSTRAINT "PropertyAssignment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyAssignment" ADD CONSTRAINT "PropertyAssignment_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerLead" ADD CONSTRAINT "BuyerLead_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

