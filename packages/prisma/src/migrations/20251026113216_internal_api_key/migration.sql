/*
  Warnings:

  - Added the required column `type` to the `apikey` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApiKeyType" AS ENUM ('INTERNAL_API_KEY', 'EXTERNAL_API_KEY');

-- AlterTable
ALTER TABLE "apikey" ADD COLUMN     "type" "ApiKeyType" NOT NULL;

-- CreateTable
CREATE TABLE "internalApiKey" (
    "id" TEXT NOT NULL,
    "apikeyId" TEXT NOT NULL,
    "encryptedKeySecret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internalApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "internalApiKey_apikeyId_key" ON "internalApiKey"("apikeyId");

-- AddForeignKey
ALTER TABLE "internalApiKey" ADD CONSTRAINT "internalApiKey_apikeyId_fkey" FOREIGN KEY ("apikeyId") REFERENCES "apikey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
