/*
  Warnings:

  - The values [UPDATE,LOGIN,LOGOUT] on the enum `EventAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EventAction_new" AS ENUM ('CREATE', 'READ', 'WRITE', 'DELETE');
ALTER TABLE "EventLog" ALTER COLUMN "action" TYPE "EventAction_new" USING ("action"::text::"EventAction_new");
ALTER TYPE "EventAction" RENAME TO "EventAction_old";
ALTER TYPE "EventAction_new" RENAME TO "EventAction";
DROP TYPE "public"."EventAction_old";
COMMIT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY['credentials.create', 'credentials.get']::TEXT[];
