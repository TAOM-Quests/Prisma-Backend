/*
  Warnings:

  - The `questions` column on the `feedback_forms` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "feedback_forms" DROP COLUMN "questions",
ADD COLUMN     "questions" JSONB[];
