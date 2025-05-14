/*
  Warnings:

  - Made the column `id_image_file` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "quest_results" DROP CONSTRAINT "quest_results_id_quest_fkey";

-- DropForeignKey
ALTER TABLE "quest_tags_on_quests" DROP CONSTRAINT "quest_tags_on_quests_id_quest_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_id_image_file_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id_image_file" SET NOT NULL,
ALTER COLUMN "id_image_file" SET DEFAULT 1;

-- AddForeignKey
ALTER TABLE "quest_results" ADD CONSTRAINT "quest_results_id_quest_fkey" FOREIGN KEY ("id_quest") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_tags_on_quests" ADD CONSTRAINT "quest_tags_on_quests_id_quest_fkey" FOREIGN KEY ("id_quest") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_image_file_fkey" FOREIGN KEY ("id_image_file") REFERENCES "shared_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
