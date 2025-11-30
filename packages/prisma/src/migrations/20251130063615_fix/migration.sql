-- DropForeignKey
ALTER TABLE "public"."auditLog" DROP CONSTRAINT "auditLog_apiKeyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."webAuthnCredential" DROP CONSTRAINT "webAuthnCredential_apiKeyId_fkey";

-- AlterTable
ALTER TABLE "auditLog" ADD COLUMN     "apiKeyIdReference" TEXT;

-- AddForeignKey
ALTER TABLE "webAuthnCredential" ADD CONSTRAINT "webAuthnCredential_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "apikey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditLog" ADD CONSTRAINT "auditLog_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "apikey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
