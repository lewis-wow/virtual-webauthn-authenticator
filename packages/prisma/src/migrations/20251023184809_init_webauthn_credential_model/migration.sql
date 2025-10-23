-- CreateTable
CREATE TABLE "webAuthnCredential" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT NOT NULL,
    "keyVaultKeyId" TEXT NOT NULL,
    "keyVaultKeyName" TEXT NOT NULL,
    "COSEPublicKey" BYTEA NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "aaguid" TEXT NOT NULL,
    "transports" TEXT[],
    "rpId" TEXT NOT NULL,
    "userHandle" BYTEA,
    "hsm" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webAuthnCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webAuthnCredential_keyVaultKeyId_key" ON "webAuthnCredential"("keyVaultKeyId");

-- CreateIndex
CREATE INDEX "webAuthnCredential_userId_idx" ON "webAuthnCredential"("userId");

-- CreateIndex
CREATE INDEX "webAuthnCredential_rpId_idx" ON "webAuthnCredential"("rpId");

-- AddForeignKey
ALTER TABLE "webAuthnCredential" ADD CONSTRAINT "webAuthnCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
