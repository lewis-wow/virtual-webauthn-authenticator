/*
  Warnings:

  - Made the column `userDisplayName` on table `webAuthnPublicKeyCredential` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "webAuthnPublicKeyCredential" ALTER COLUMN "userDisplayName" SET NOT NULL;
