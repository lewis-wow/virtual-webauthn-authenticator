/*
  Warnings:

  - Added the required column `isClientSideDiscoverable` to the `webAuthnPublicKeyCredential` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "webAuthnPublicKeyCredential" ADD COLUMN     "isClientSideDiscoverable" BOOLEAN NOT NULL;
