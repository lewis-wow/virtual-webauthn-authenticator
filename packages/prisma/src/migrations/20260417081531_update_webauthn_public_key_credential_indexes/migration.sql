-- DropIndex
DROP INDEX "public"."webAuthnPublicKeyCredential_userId_idx";

-- CreateIndex
CREATE INDEX "webAuthnPublicKeyCredential_userId_rpId_idx" ON "webAuthnPublicKeyCredential"("userId", "rpId");
