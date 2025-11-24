/*
  Warnings:

  - You are about to drop the column `alreadyHaveCreatedWebAuthnCredential` on the `apikey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "apikey" DROP COLUMN "alreadyHaveCreatedWebAuthnCredential",
ADD COLUMN     "createdWebAuthnCredentialId" TEXT;
