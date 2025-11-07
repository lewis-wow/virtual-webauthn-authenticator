-- AlterTable
ALTER TABLE "webAuthnCredential" ALTER COLUMN "webAuthnCredentialKeyMetaType" DROP NOT NULL,
ALTER COLUMN "webAuthnCredentialKeyMetaType" DROP DEFAULT;
