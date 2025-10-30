/*
  Warnings:

  - You are about to drop the column `keyHash` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `apikey` table. All the data in the column will be lost.
  - You are about to drop the `internalApiKey` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `key` to the `apikey` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."internalApiKey" DROP CONSTRAINT "internalApiKey_apikeyId_fkey";

-- AlterTable
ALTER TABLE "apikey" DROP COLUMN "keyHash",
DROP COLUMN "type",
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "lastRefillAt" TIMESTAMP(3),
ADD COLUMN     "lastRequest" TIMESTAMP(3),
ADD COLUMN     "metadata" TEXT,
ADD COLUMN     "rateLimitEnabled" BOOLEAN DEFAULT true,
ADD COLUMN     "rateLimitMax" INTEGER,
ADD COLUMN     "rateLimitTimeWindow" INTEGER,
ADD COLUMN     "refillAmount" INTEGER,
ADD COLUMN     "refillInterval" INTEGER,
ADD COLUMN     "remaining" INTEGER,
ADD COLUMN     "requestCount" INTEGER,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "start" DROP NOT NULL,
ALTER COLUMN "prefix" DROP NOT NULL,
ALTER COLUMN "enabled" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."internalApiKey";
