/*
  Warnings:

  - You are about to drop the column `webAuthnCredentialKeyVaultKeyMetaId` on the `webAuthnCredential` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[webAuthnCredentialId]` on the table `webAuthnCredentialKeyVaultKeyMeta` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `webAuthnCredentialId` to the `webAuthnCredentialKeyVaultKeyMeta` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."webAuthnCredential" DROP CONSTRAINT "webAuthnCredential_webAuthnCredentialKeyVaultKeyMetaId_fkey";

-- DropIndex
DROP INDEX "public"."webAuthnCredential_webAuthnCredentialKeyVaultKeyMetaId_key";

-- AlterTable
ALTER TABLE "webAuthnCredential" DROP COLUMN "webAuthnCredentialKeyVaultKeyMetaId";

-- AlterTable
ALTER TABLE "webAuthnCredentialKeyVaultKeyMeta" ADD COLUMN     "webAuthnCredentialId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "webAuthnCredentialKeyVaultKeyMeta_webAuthnCredentialId_key" ON "webAuthnCredentialKeyVaultKeyMeta"("webAuthnCredentialId");

-- AddForeignKey
ALTER TABLE "webAuthnCredentialKeyVaultKeyMeta" ADD CONSTRAINT "webAuthnCredentialKeyVaultKeyMeta_webAuthnCredentialId_fkey" FOREIGN KEY ("webAuthnCredentialId") REFERENCES "webAuthnCredential"("id") ON DELETE CASCADE ON UPDATE CASCADE;
