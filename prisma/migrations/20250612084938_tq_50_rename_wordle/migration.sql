/*
  Warnings:

  - You are about to drop the `game_wordle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "game_wordle" DROP CONSTRAINT "game_wordle_department_id_fkey";

-- DropTable
DROP TABLE "game_wordle";

-- CreateTable
CREATE TABLE "game_wordle_words" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "game_wordle_words_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_wordle_words_word_department_id_key" ON "game_wordle_words"("word", "department_id");

-- AddForeignKey
ALTER TABLE "game_wordle_words" ADD CONSTRAINT "game_wordle_words_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
