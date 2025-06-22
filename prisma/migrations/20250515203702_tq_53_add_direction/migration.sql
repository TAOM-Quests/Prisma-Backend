/*
  Warnings:

  - Added the required column `direction` to the `game_crossword_answers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "game_crossword_answers" ADD COLUMN     "direction" TEXT NOT NULL;
