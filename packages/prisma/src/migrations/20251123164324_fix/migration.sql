/*
  Warnings:

  - You are about to drop the column `ipAddress` on the `EventLog` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `EventLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventLog" DROP COLUMN "ipAddress",
DROP COLUMN "userAgent";
