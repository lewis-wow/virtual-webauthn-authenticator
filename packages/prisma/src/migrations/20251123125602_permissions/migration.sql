/*
  Warnings:

  - You are about to drop the column `permissions` on the `apikey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[action,resourceType,resourceId]` on the table `permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `permissionSubject` to the `permission` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `action` on the `permission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `resourceType` on the `permission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PermissionSubject" AS ENUM ('API_KEY', 'USER');

-- DropIndex
DROP INDEX "public"."permission_userId_action_resourceType_resourceId_key";

-- AlterTable
ALTER TABLE "apikey" DROP COLUMN "permissions";

-- AlterTable
ALTER TABLE "permission" ADD COLUMN     "apiKeyId" TEXT,
ADD COLUMN     "permissionSubject" "PermissionSubject" NOT NULL,
DROP COLUMN "action",
ADD COLUMN     "action" TEXT NOT NULL,
DROP COLUMN "resourceType",
ADD COLUMN     "resourceType" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- DropEnum
DROP TYPE "public"."PermissionAction";

-- DropEnum
DROP TYPE "public"."ResourceType";

-- CreateIndex
CREATE UNIQUE INDEX "permission_action_resourceType_resourceId_key" ON "permission"("action", "resourceType", "resourceId");

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "permission_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "apikey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
