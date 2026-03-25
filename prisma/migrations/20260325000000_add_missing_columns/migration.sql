-- Agency: trial and contract fields
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3);
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "trialUsed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "contractAcceptedAt" TIMESTAMP(3);
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "privacyAcceptedAt" TIMESTAMP(3);
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "zeroCommissionAcceptedAt" TIMESTAMP(3);
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "clausoleAcceptedAt" TIMESTAMP(3);
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "registroAcceptedAt" TIMESTAMP(3);
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "contractVersion" TEXT;
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "contractAcceptedIp" TEXT;

-- Property: video and virtual tour URLs
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "virtualTourUrl" TEXT;

-- SavedSearch: email alerts
ALTER TABLE "SavedSearch" ADD COLUMN IF NOT EXISTS "emailAlerts" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SavedSearch" ADD COLUMN IF NOT EXISTS "lastNotifiedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "SavedSearch_emailAlerts_lastNotifiedAt_idx" ON "SavedSearch"("emailAlerts", "lastNotifiedAt");

-- Complaint model
CREATE TABLE IF NOT EXISTS "Complaint" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Complaint_referenceNumber_key" ON "Complaint"("referenceNumber");
CREATE INDEX IF NOT EXISTS "Complaint_status_idx" ON "Complaint"("status");
CREATE INDEX IF NOT EXISTS "Complaint_email_idx" ON "Complaint"("email");

-- AuditLog model
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "targetId" TEXT,
    "details" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
