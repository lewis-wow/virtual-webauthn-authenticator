/*
  Warnings:

  - Added the required column `userName` to the `webAuthnPublicKeyCredential` table without a default value. This is not possible if the table is not empty.
  - Made the column `userHandle` on table `webAuthnPublicKeyCredential` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "webAuthnPublicKeyCredential" ADD COLUMN     "userDisplayName" TEXT,
ADD COLUMN     "userName" TEXT NOT NULL,
ALTER COLUMN "userHandle" SET NOT NULL;
