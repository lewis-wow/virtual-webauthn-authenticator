/*
  Warnings:

  - You are about to drop the `EventLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."EventLog" DROP CONSTRAINT "EventLog_apiKeyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventLog" DROP CONSTRAINT "EventLog_userId_fkey";

-- DropTable
DROP TABLE "public"."EventLog";

-- CreateTable
CREATE TABLE "auditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "userId" TEXT NOT NULL,
    "apiKeyId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auditLog_createdAt_idx" ON "auditLog"("createdAt");

-- CreateIndex
CREATE INDEX "auditLog_entity_entityId_idx" ON "auditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "auditLog_userId_idx" ON "auditLog"("userId");

-- CreateIndex
CREATE INDEX "auditLog_apiKeyId_idx" ON "auditLog"("apiKeyId");

-- AddForeignKey
ALTER TABLE "auditLog" ADD CONSTRAINT "auditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditLog" ADD CONSTRAINT "auditLog_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "apikey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
