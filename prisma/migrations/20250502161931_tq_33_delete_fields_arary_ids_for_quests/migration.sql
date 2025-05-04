/*
  Warnings:

  - You are about to drop the column `questions_ids` on the `answers` table. All the data in the column will be lost.
  - You are about to drop the column `id_users` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `quest_groups_ids` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `quest_tags_ids` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `quests_ids` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `complete_quests_ids` on the `quests` table. All the data in the column will be lost.
  - You are about to drop the column `questions_ids` on the `quests` table. All the data in the column will be lost.
  - You are about to drop the column `result_ids` on the `quests` table. All the data in the column will be lost.
  - You are about to drop the column `tags_ids` on the `quests` table. All the data in the column will be lost.
  - Made the column `correct_answers` on table `answers_box_sorting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `correct_answers` on table `answers_free` required. This step will fail if there are existing NULL values in that column.
  - Made the column `correct_answers` on table `answers_single` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "answers" DROP COLUMN "questions_ids";

-- AlterTable
ALTER TABLE "answers_box_sorting" ALTER COLUMN "correct_answers" SET NOT NULL;

-- AlterTable
ALTER TABLE "answers_free" ALTER COLUMN "correct_answers" SET NOT NULL;

-- AlterTable
ALTER TABLE "answers_single" ALTER COLUMN "correct_answers" SET NOT NULL;

-- AlterTable
ALTER TABLE "departments" DROP COLUMN "id_users",
DROP COLUMN "quest_groups_ids",
DROP COLUMN "quest_tags_ids",
DROP COLUMN "quests_ids";

-- AlterTable
ALTER TABLE "quests" DROP COLUMN "complete_quests_ids",
DROP COLUMN "questions_ids",
DROP COLUMN "result_ids",
DROP COLUMN "tags_ids";
