/*
  Warnings:

  - A unique constraint covering the columns `[apiKeyId,action,resourceType,resourceId]` on the table `permission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,action,resourceType,resourceId]` on the table `permission` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."permission_action_resourceType_resourceId_key";

-- CreateIndex
CREATE UNIQUE INDEX "permission_apiKeyId_action_resourceType_resourceId_key" ON "permission"("apiKeyId", "action", "resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "permission_userId_action_resourceType_resourceId_key" ON "permission"("userId", "action", "resourceType", "resourceId");
