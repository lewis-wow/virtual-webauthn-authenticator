/*
Warnings:

- Made the column `webAuthnPublicKeyCredentialKeyMetaType` on table `webAuthnCredential` required. This step will fail if there are existing NULL values in that column.

 */
-- AlterTable
ALTER TABLE "webAuthnCredential"
ALTER COLUMN "webAuthnPublicKeyCredentialKeyMetaType"
SET
  NOT NULL;
