-- CreateEnum
CREATE TYPE "ApiKeyType" AS ENUM ('INTERNAL_API_KEY', 'EXTERNAL_API_KEY');

-- CreateEnum
CREATE TYPE "PermissionSubject" AS ENUM ('API_KEY', 'USER');

-- CreateEnum
CREATE TYPE "WebAuthnPublicKeyCredentialKeyMetaType" AS ENUM ('KEY_VAULT');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apikey" (
    "id" TEXT NOT NULL,
    "lookupKey" TEXT NOT NULL,
    "name" TEXT,
    "prefix" TEXT,
    "start" TEXT,
    "hashedKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apikey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jwks" (
    "id" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jwks_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "auditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "userId" TEXT NOT NULL,
    "apiKeyId" TEXT,
    "apiKeyIdReference" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "apikey_lookupKey_key" ON "apikey"("lookupKey");

-- CreateIndex
CREATE INDEX "webAuthnPublicKeyCredential_userId_idx" ON "webAuthnPublicKeyCredential"("userId");

-- CreateIndex
CREATE INDEX "webAuthnPublicKeyCredential_rpId_idx" ON "webAuthnPublicKeyCredential"("rpId");

-- CreateIndex
CREATE UNIQUE INDEX "webAuthnPublicKeyCredentialKeyVaultKeyMeta_keyVaultKeyId_key" ON "webAuthnPublicKeyCredentialKeyVaultKeyMeta"("keyVaultKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "webAuthnPublicKeyCredentialKeyVaultKeyMeta_webAuthnPublicKe_key" ON "webAuthnPublicKeyCredentialKeyVaultKeyMeta"("webAuthnPublicKeyCredentialId");

-- CreateIndex
CREATE INDEX "auditLog_createdAt_idx" ON "auditLog"("createdAt");

-- CreateIndex
CREATE INDEX "auditLog_entity_entityId_idx" ON "auditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "auditLog_userId_idx" ON "auditLog"("userId");

-- CreateIndex
CREATE INDEX "auditLog_apiKeyId_idx" ON "auditLog"("apiKeyId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webAuthnPublicKeyCredential" ADD CONSTRAINT "webAuthnPublicKeyCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webAuthnPublicKeyCredential" ADD CONSTRAINT "webAuthnPublicKeyCredential_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "apikey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webAuthnPublicKeyCredentialKeyVaultKeyMeta" ADD CONSTRAINT "webAuthnPublicKeyCredentialKeyVaultKeyMeta_webAuthnPublicK_fkey" FOREIGN KEY ("webAuthnPublicKeyCredentialId") REFERENCES "webAuthnPublicKeyCredential"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditLog" ADD CONSTRAINT "auditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditLog" ADD CONSTRAINT "auditLog_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "apikey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
