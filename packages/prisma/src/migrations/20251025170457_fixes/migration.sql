/*
  Warnings:

  - You are about to drop the column `key` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `lastRefillAt` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `lastRequest` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `rateLimitEnabled` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `rateLimitMax` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `rateLimitTimeWindow` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `refillAmount` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `refillInterval` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `remaining` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `requestCount` on the `apikey` table. All the data in the column will be lost.
  - Added the required column `keyHash` to the `apikey` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `apikey` required. This step will fail if there are existing NULL values in that column.
  - Made the column `start` on table `apikey` required. This step will fail if there are existing NULL values in that column.
  - Made the column `prefix` on table `apikey` required. This step will fail if there are existing NULL values in that column.
  - Made the column `enabled` on table `apikey` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "apikey" DROP COLUMN "key",
DROP COLUMN "lastRefillAt",
DROP COLUMN "lastRequest",
DROP COLUMN "metadata",
DROP COLUMN "rateLimitEnabled",
DROP COLUMN "rateLimitMax",
DROP COLUMN "rateLimitTimeWindow",
DROP COLUMN "refillAmount",
DROP COLUMN "refillInterval",
DROP COLUMN "remaining",
DROP COLUMN "requestCount",
ADD COLUMN     "keyHash" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "start" SET NOT NULL,
ALTER COLUMN "prefix" SET NOT NULL,
ALTER COLUMN "enabled" SET NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
