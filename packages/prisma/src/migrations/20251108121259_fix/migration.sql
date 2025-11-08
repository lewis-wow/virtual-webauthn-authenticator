/*
  Warnings:

  - The `permissions` column on the `apikey` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `metadata` column on the `apikey` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "apikey" DROP COLUMN "permissions",
ADD COLUMN     "permissions" JSONB,
DROP COLUMN "metadata",
ADD COLUMN     "metadata" JSONB;
