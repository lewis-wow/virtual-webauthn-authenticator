/*
  Warnings:

  - You are about to drop the `ApiToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RolePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('API_KEYS', 'CREDENTIALS');

-- DropForeignKey
ALTER TABLE "public"."ApiToken" DROP CONSTRAINT "ApiToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserRole" DROP CONSTRAINT "UserRole_roleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserRole" DROP CONSTRAINT "UserRole_userId_fkey";

-- DropTable
DROP TABLE "public"."ApiToken";

-- DropTable
DROP TABLE "public"."Permission";

-- DropTable
DROP TABLE "public"."Role";

-- DropTable
DROP TABLE "public"."RolePermission";

-- DropTable
DROP TABLE "public"."UserRole";

-- DropEnum
DROP TYPE "public"."PermissionResource";

-- DropEnum
DROP TYPE "public"."RoleName";

-- CreateTable
CREATE TABLE "permission" (
    "id" TEXT NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "resourceId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permission_userId_action_resourceType_resourceId_key" ON "permission"("userId", "action", "resourceType", "resourceId");

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
