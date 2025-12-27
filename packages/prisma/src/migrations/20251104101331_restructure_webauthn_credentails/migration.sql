/*
Warnings:

- You are about to drop the column `aaguid` on the `webAuthnCredential` table. All the data in the column will be lost.
- You are about to drop the column `createdAt` on the `webAuthnCredential` table. All the data in the column will be lost.
- You are about to drop the column `hsm` on the `webAuthnCredential` table. All the data in the column will be lost.
- You are about to drop the column `keyVaultKeyId` on the `webAuthnCredential` table. All the data in the column will be lost.
- You are about to drop the column `keyVaultKeyName` on the `webAuthnCredential` table. All the data in the column will be lost.
- You are about to drop the column `updatedAt` on the `webAuthnCredential` table. All the data in the column will be lost.
- A unique constraint covering the columns `[webAuthnCredentialKeyVaultKeyMetaId]` on the table `webAuthnCredential` will be added. If there are existing duplicate values, this will fail.
- Added the required column `webAuthnCredentialKeyVaultKeyMetaId` to the `webAuthnCredential` table without a default value. This is not possible if the table is not empty.

 */
-- DropIndex
DROP INDEX "public"."webAuthnCredential_keyVaultKeyId_key";

-- AlterTable
ALTER TABLE "webAuthnCredential"
DROP COLUMN "aaguid",
DROP COLUMN "createdAt",
DROP COLUMN "hsm",
DROP COLUMN "keyVaultKeyId",
DROP COLUMN "keyVaultKeyName",
DROP COLUMN "updatedAt",
ADD COLUMN "webAuthnCredentialKeyVaultKeyMetaId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE
  "webAuthnPublicKeyCredentialKeyVaultKeyMeta" (
    "id" TEXT NOT NULL,
    "keyVaultKeyId" TEXT,
    "keyVaultKeyName" TEXT NOT NULL,
    "hsm" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "webAuthnCredentialKeyVaultKeyMeta_pkey" PRIMARY KEY ("id")
  );

-- CreateIndex
CREATE UNIQUE INDEX "webAuthnCredentialKeyVaultKeyMeta_keyVaultKeyId_key" ON "webAuthnPublicKeyCredentialKeyVaultKeyMeta" ("keyVaultKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "webAuthnCredential_webAuthnCredentialKeyVaultKeyMetaId_key" ON "webAuthnCredential" ("webAuthnCredentialKeyVaultKeyMetaId");

-- AddForeignKey
ALTER TABLE "webAuthnCredential" ADD CONSTRAINT "webAuthnCredential_webAuthnCredentialKeyVaultKeyMetaId_fkey" FOREIGN KEY ("webAuthnCredentialKeyVaultKeyMetaId") REFERENCES "webAuthnPublicKeyCredentialKeyVaultKeyMeta" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
