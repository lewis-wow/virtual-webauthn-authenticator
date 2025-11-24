/*
  Warnings:

  - You are about to drop the column `alreadyCreatedWebAuthnCredential` on the `apikey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "apikey" DROP COLUMN "alreadyCreatedWebAuthnCredential",
ADD COLUMN     "alreadyHaveCreatedWebAuthnCredential" BOOLEAN NOT NULL DEFAULT false;
