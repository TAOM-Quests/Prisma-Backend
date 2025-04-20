/*
  Warnings:

  - Added the required column `id_executor` to the `quests` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "quests" DROP CONSTRAINT "quests_id_difficult_fkey";

-- DropForeignKey
ALTER TABLE "quests" DROP CONSTRAINT "quests_id_group_fkey";

-- AlterTable
ALTER TABLE "quests" ADD COLUMN     "id_executor" INTEGER NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "id_group" DROP NOT NULL,
ALTER COLUMN "id_difficult" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_id_difficult_fkey" FOREIGN KEY ("id_difficult") REFERENCES "quest_difficulties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_id_group_fkey" FOREIGN KEY ("id_group") REFERENCES "quest_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_id_executor_fkey" FOREIGN KEY ("id_executor") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
