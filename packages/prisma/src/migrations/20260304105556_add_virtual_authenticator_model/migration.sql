/*
  Warnings:

  - Added the required column `virtualAuthenticatorId` to the `webAuthnPublicKeyCredential` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VirtualAuthenticatorUserVerificationType" AS ENUM ('NONE', 'PIN');

-- AlterTable
ALTER TABLE "webAuthnPublicKeyCredential" ADD COLUMN     "virtualAuthenticatorId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "VirtualAuthenticator" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userVerificationType" "VirtualAuthenticatorUserVerificationType" NOT NULL,
    "pin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualAuthenticator_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VirtualAuthenticator" ADD CONSTRAINT "VirtualAuthenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webAuthnPublicKeyCredential" ADD CONSTRAINT "webAuthnPublicKeyCredential_virtualAuthenticatorId_fkey" FOREIGN KEY ("virtualAuthenticatorId") REFERENCES "VirtualAuthenticator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
