/*
  Warnings:

  - You are about to drop the column `key` on the `apikey` table. All the data in the column will be lost.
  - Added the required column `hashedKey` to the `apikey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "apikey" DROP COLUMN "key",
ADD COLUMN     "hashedKey" TEXT NOT NULL;
