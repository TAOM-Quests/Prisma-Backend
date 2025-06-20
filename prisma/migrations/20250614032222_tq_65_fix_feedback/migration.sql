/*
  Warnings:

  - You are about to drop the column `quest_questions` on the `feedback_forms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "feedback_forms" DROP COLUMN "quest_questions",
ADD COLUMN     "questions" JSONB[];
