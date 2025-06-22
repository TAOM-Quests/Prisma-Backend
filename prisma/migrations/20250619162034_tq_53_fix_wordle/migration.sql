/*
  Warnings:

  - You are about to drop the `game_wordle_words_answers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "game_wordle_words_answers" DROP CONSTRAINT "game_wordle_words_answers_department_id_fkey";

-- DropTable
DROP TABLE "game_wordle_words_answers";

-- CreateTable
CREATE TABLE "game_wordle_answers" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "word" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "game_wordle_answers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game_wordle_answers" ADD CONSTRAINT "game_wordle_answers_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
