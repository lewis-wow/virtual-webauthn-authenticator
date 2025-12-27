-- AlterTable
ALTER TABLE "webAuthnCredential"
ALTER COLUMN "webAuthnPublicKeyCredentialKeyMetaType"
DROP NOT NULL,
ALTER COLUMN "webAuthnPublicKeyCredentialKeyMetaType"
DROP DEFAULT;
