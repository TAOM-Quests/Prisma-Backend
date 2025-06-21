/*
  Warnings:

  - The `images_ids` column on the `answers_box_sorting` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `correct_answers` column on the `answers_connection` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `correct_answers` column on the `answers_multiple` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `images_ids` column on the `answers_single` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "answers_box_sorting" DROP COLUMN "images_ids",
ADD COLUMN     "images_ids" JSONB[];

-- AlterTable
ALTER TABLE "answers_connection" DROP COLUMN "correct_answers",
ADD COLUMN     "correct_answers" JSONB[];

-- AlterTable
ALTER TABLE "answers_multiple" DROP COLUMN "correct_answers",
ADD COLUMN     "correct_answers" JSONB[];

-- AlterTable
ALTER TABLE "answers_single" DROP COLUMN "images_ids",
ADD COLUMN     "images_ids" JSONB[];
