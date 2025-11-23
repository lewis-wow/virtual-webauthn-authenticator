/*
  Warnings:

  - You are about to drop the `permission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."permission" DROP CONSTRAINT "permission_apiKeyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."permission" DROP CONSTRAINT "permission_userId_fkey";

-- AlterTable
ALTER TABLE "apikey" ADD COLUMN     "permissions" TEXT[];

-- DropTable
DROP TABLE "public"."permission";
