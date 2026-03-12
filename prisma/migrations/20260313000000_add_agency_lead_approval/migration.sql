-- AlterEnum
ALTER TYPE "LeadStatus" ADD VALUE 'APPROVED';

-- AlterTable
ALTER TABLE "AgencyLead" ADD COLUMN "approvalToken" TEXT,
ADD COLUMN "approvedAt" TIMESTAMP(3);
