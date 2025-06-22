/*
  Warnings:

  - Added the required column `difficulty_id` to the `game_crossword_answers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "game_crossword_answers" ADD COLUMN     "difficulty_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "game_crossword_answers" ADD CONSTRAINT "game_crossword_answers_difficulty_id_fkey" FOREIGN KEY ("difficulty_id") REFERENCES "game_crossword_difficulties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
