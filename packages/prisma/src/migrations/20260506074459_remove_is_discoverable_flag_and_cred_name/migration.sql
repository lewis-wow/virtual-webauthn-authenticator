/*
  Warnings:

  - You are about to drop the column `isClientSideDiscoverable` on the `webAuthnPublicKeyCredential` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `webAuthnPublicKeyCredential` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "webAuthnPublicKeyCredential" DROP COLUMN "isClientSideDiscoverable",
DROP COLUMN "name";
