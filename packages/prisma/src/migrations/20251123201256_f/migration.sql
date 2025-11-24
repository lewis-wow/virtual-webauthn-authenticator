/*
  Warnings:

  - You are about to drop the column `createdWebAuthnCredentialId` on the `apikey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "apikey" DROP COLUMN "createdWebAuthnCredentialId";

-- AlterTable
ALTER TABLE "webAuthnCredential" ADD COLUMN     "apiKeyId" TEXT;

-- AddForeignKey
ALTER TABLE "webAuthnCredential" ADD CONSTRAINT "webAuthnCredential_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "apikey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
