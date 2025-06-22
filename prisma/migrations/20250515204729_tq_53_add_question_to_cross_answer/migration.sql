/*
  Warnings:

  - Added the required column `question` to the `game_crossword_answers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "game_crossword_answers" ADD COLUMN     "question" TEXT NOT NULL;
