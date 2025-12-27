/*
  Warnings:

  - You are about to drop the `webAuthnCredential` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `webAuthnCredentialKeyVaultKeyMeta` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "WebAuthnPublicKeyCredentialKeyMetaType" AS ENUM ('KEY_VAULT');

-- DropForeignKey
ALTER TABLE "public"."webAuthnCredential" DROP CONSTRAINT "webAuthnCredential_apiKeyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."webAuthnCredential" DROP CONSTRAINT "webAuthnCredential_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."webAuthnCredentialKeyVaultKeyMeta" DROP CONSTRAINT "webAuthnCredentialKeyVaultKeyMeta_webAuthnCredentialId_fkey";

-- DropTable
DROP TABLE "public"."webAuthnCredential";

-- DropTable
DROP TABLE "public"."webAuthnCredentialKeyVaultKeyMeta";

-- DropEnum
DROP TYPE "public"."WebAuthnCredentialKeyMetaType";

-- CreateTable
CREATE TABLE "webAuthnPublicKeyCredential" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT NOT NULL,
    "apiKeyId" TEXT,
    "COSEPublicKey" BYTEA NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "transports" TEXT[],
    "webAuthnPublicKeyCredentialKeyMetaType" "WebAuthnPublicKeyCredentialKeyMetaType" NOT NULL,
    "rpId" TEXT NOT NULL,
    "userHandle" BYTEA,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webAuthnPublicKeyCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webAuthnPublicKeyCredentialKeyVaultKeyMeta" (
    "id" TEXT NOT NULL,
    "keyVaultKeyId" TEXT,
    "keyVaultKeyName" TEXT NOT NULL,
    "hsm" BOOLEAN NOT NULL DEFAULT false,
    "webAuthnPublicKeyCredentialId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webAuthnPublicKeyCredentialKeyVaultKeyMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "webAuthnPublicKeyCredential_userId_idx" ON "webAuthnPublicKeyCredential"("userId");

-- CreateIndex
CREATE INDEX "webAuthnPublicKeyCredential_rpId_idx" ON "webAuthnPublicKeyCredential"("rpId");

-- CreateIndex
CREATE UNIQUE INDEX "webAuthnPublicKeyCredentialKeyVaultKeyMeta_keyVaultKeyId_key" ON "webAuthnPublicKeyCredentialKeyVaultKeyMeta"("keyVaultKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "webAuthnPublicKeyCredentialKeyVaultKeyMeta_webAuthnPublicKe_key" ON "webAuthnPublicKeyCredentialKeyVaultKeyMeta"("webAuthnPublicKeyCredentialId");

-- AddForeignKey
ALTER TABLE "webAuthnPublicKeyCredential" ADD CONSTRAINT "webAuthnPublicKeyCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webAuthnPublicKeyCredential" ADD CONSTRAINT "webAuthnPublicKeyCredential_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "apikey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webAuthnPublicKeyCredentialKeyVaultKeyMeta" ADD CONSTRAINT "webAuthnPublicKeyCredentialKeyVaultKeyMeta_webAuthnPublicK_fkey" FOREIGN KEY ("webAuthnPublicKeyCredentialId") REFERENCES "webAuthnPublicKeyCredential"("id") ON DELETE CASCADE ON UPDATE CASCADE;
