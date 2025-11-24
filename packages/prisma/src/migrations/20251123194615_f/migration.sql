/*
  Warnings:

  - You are about to drop the column `webAuthnCredentialId` on the `apikey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "apikey" DROP COLUMN "webAuthnCredentialId",
ADD COLUMN     "createdWebAuthnCredentialId" TEXT;
