/*
  Warnings:

  - You are about to drop the column `userDisplayName` on the `webAuthnPublicKeyCredential` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `webAuthnPublicKeyCredential` table. All the data in the column will be lost.
  - Added the required column `rpUserDisplayName` to the `webAuthnPublicKeyCredential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rpUserName` to the `webAuthnPublicKeyCredential` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "webAuthnPublicKeyCredential" DROP COLUMN "userDisplayName",
DROP COLUMN "userName",
ADD COLUMN     "rpUserDisplayName" TEXT NOT NULL,
ADD COLUMN     "rpUserName" TEXT NOT NULL;
