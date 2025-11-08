/*
  Warnings:

  - You are about to drop the column `lastRefillAt` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `lastRequest` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `rateLimitEnabled` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `rateLimitMax` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `rateLimitTimeWindow` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `refillAmount` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `refillInterval` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `remaining` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `requestCount` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `start` on the `apikey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lookupKey]` on the table `apikey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lookupKey` to the `apikey` table without a default value. This is not possible if the table is not empty.
  - Made the column `enabled` on table `apikey` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "apikey" DROP COLUMN "lastRefillAt",
DROP COLUMN "lastRequest",
DROP COLUMN "rateLimitEnabled",
DROP COLUMN "rateLimitMax",
DROP COLUMN "rateLimitTimeWindow",
DROP COLUMN "refillAmount",
DROP COLUMN "refillInterval",
DROP COLUMN "remaining",
DROP COLUMN "requestCount",
DROP COLUMN "start",
ADD COLUMN     "lookupKey" TEXT NOT NULL,
ALTER COLUMN "enabled" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "apikey_lookupKey_key" ON "apikey"("lookupKey");
