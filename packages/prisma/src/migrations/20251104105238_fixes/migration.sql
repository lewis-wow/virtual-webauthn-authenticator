/*
  Warnings:

  - You are about to drop the column `webAuthnCredentialId` on the `webAuthnCredentialKeyVaultKeyMeta` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[webAuthnCredentialKeyVaultKeyMetaId]` on the table `webAuthnCredential` will be added. If there are existing duplicate values, this will fail.
  - Made the column `keyVaultKeyId` on table `webAuthnCredentialKeyVaultKeyMeta` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "WebAuthnCredentialKeyMetaType" AS ENUM ('KEY_VAULT');

-- DropForeignKey
ALTER TABLE "public"."webAuthnCredentialKeyVaultKeyMeta" DROP CONSTRAINT "webAuthnCredentialKeyVaultKeyMeta_webAuthnCredentialId_fkey";

-- DropIndex
DROP INDEX "public"."webAuthnCredentialKeyVaultKeyMeta_webAuthnCredentialId_key";

-- AlterTable
ALTER TABLE "webAuthnCredential" ADD COLUMN     "webAuthnCredentialKeyMetaType" "WebAuthnCredentialKeyMetaType" NOT NULL DEFAULT 'KEY_VAULT',
ADD COLUMN     "webAuthnCredentialKeyVaultKeyMetaId" TEXT;

-- AlterTable
ALTER TABLE "webAuthnCredentialKeyVaultKeyMeta" DROP COLUMN "webAuthnCredentialId",
ALTER COLUMN "keyVaultKeyId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "webAuthnCredential_webAuthnCredentialKeyVaultKeyMetaId_key" ON "webAuthnCredential"("webAuthnCredentialKeyVaultKeyMetaId");

-- AddForeignKey
ALTER TABLE "webAuthnCredential" ADD CONSTRAINT "webAuthnCredential_webAuthnCredentialKeyVaultKeyMetaId_fkey" FOREIGN KEY ("webAuthnCredentialKeyVaultKeyMetaId") REFERENCES "webAuthnCredentialKeyVaultKeyMeta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
