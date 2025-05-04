/*
  Warnings:

  - Added the required column `min_points` to the `quest_results` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quest_results" ADD COLUMN     "id_image" INTEGER,
ADD COLUMN     "min_points" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "quest_results" ADD CONSTRAINT "quest_results_id_image_fkey" FOREIGN KEY ("id_image") REFERENCES "shared_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
