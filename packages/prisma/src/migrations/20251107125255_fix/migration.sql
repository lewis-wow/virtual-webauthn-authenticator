/*
  Warnings:

  - Made the column `webAuthnCredentialKeyMetaType` on table `webAuthnCredential` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "webAuthnCredential" ALTER COLUMN "webAuthnCredentialKeyMetaType" SET NOT NULL;
