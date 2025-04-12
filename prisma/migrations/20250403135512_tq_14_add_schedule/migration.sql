/*
  Warnings:

  - You are about to drop the column `id_department` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "id_department",
ADD COLUMN     "schedule" JSONB[];
