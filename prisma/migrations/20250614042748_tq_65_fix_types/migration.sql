/*
  Warnings:

  - The `images_ids` column on the `answers_connection` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `images_ids` column on the `answers_multiple` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `correct_answers` column on the `answers_multiple` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "answers_connection" DROP COLUMN "images_ids",
ADD COLUMN     "images_ids" JSONB[],
ALTER COLUMN "correct_answers" SET DATA TYPE TEXT[];

-- AlterTable
ALTER TABLE "answers_multiple" DROP COLUMN "images_ids",
ADD COLUMN     "images_ids" JSONB[],
DROP COLUMN "correct_answers",
ADD COLUMN     "correct_answers" INTEGER[];
