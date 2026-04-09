-- CreateTable
CREATE TABLE "ChatbotLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fallbackTriggered" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT,
    "pagePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatbotLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatbotLog_sessionId_idx" ON "ChatbotLog"("sessionId");

-- CreateIndex
CREATE INDEX "ChatbotLog_createdAt_idx" ON "ChatbotLog"("createdAt");

-- CreateIndex
CREATE INDEX "ChatbotLog_fallbackTriggered_idx" ON "ChatbotLog"("fallbackTriggered");
