/*
  Warnings:

  - You are about to drop the column `createdWebAuthnCredentialId` on the `apikey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "apikey" DROP COLUMN "createdWebAuthnCredentialId",
ADD COLUMN     "alreadyCreatedWebAuthnCredential" BOOLEAN NOT NULL DEFAULT false;
