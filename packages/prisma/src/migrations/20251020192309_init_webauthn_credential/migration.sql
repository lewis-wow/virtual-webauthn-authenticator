-- CreateTable
CREATE TABLE "webAuthnCredential" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT NOT NULL,
    "keyVaultKeyId" TEXT NOT NULL,
    "credentialID" TEXT NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL,
    "aaguid" TEXT NOT NULL,
    "transports" TEXT[],
    "isBackedUp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webAuthnCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webAuthnCredential_keyVaultKeyId_key" ON "webAuthnCredential"("keyVaultKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "webAuthnCredential_credentialID_key" ON "webAuthnCredential"("credentialID");

-- CreateIndex
CREATE INDEX "webAuthnCredential_userId_idx" ON "webAuthnCredential"("userId");

-- AddForeignKey
ALTER TABLE "webAuthnCredential" ADD CONSTRAINT "webAuthnCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
