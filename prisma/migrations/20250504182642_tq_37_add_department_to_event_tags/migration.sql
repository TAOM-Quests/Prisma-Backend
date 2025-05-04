/*
  Warnings:

  - Added the required column `department_id` to the `event_tags` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event_tags" ADD COLUMN     "department_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "event_tags" ADD CONSTRAINT "event_tags_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
