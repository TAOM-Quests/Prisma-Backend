/*
  Warnings:

  - Added the required column `id_department` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "id_department" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_id_department_fkey" FOREIGN KEY ("id_department") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
