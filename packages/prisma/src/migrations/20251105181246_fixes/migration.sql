/*
Warnings:

- Made the column `webAuthnCredentialKeyVaultKeyMetaId` on table `webAuthnCredential` required. This step will fail if there are existing NULL values in that column.

 */
-- DropForeignKey
ALTER TABLE "public"."webAuthnCredential"
DROP CONSTRAINT "webAuthnCredential_webAuthnCredentialKeyVaultKeyMetaId_fkey";

-- AlterTable
ALTER TABLE "webAuthnCredential"
ALTER COLUMN "webAuthnCredentialKeyVaultKeyMetaId"
SET
  NOT NULL;

-- AddForeignKey
ALTER TABLE "webAuthnCredential" ADD CONSTRAINT "webAuthnCredential_webAuthnCredentialKeyVaultKeyMetaId_fkey" FOREIGN KEY ("webAuthnCredentialKeyVaultKeyMetaId") REFERENCES "webAuthnPublicKeyCredentialKeyVaultKeyMeta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
