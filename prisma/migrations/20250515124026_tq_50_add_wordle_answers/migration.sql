/*
  Warnings:

  - You are about to drop the column `is_today_word` on the `game_wordle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "game_wordle" DROP COLUMN "is_today_word";

-- CreateTable
CREATE TABLE "game_wordle_answers" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_department" INTEGER NOT NULL,

    CONSTRAINT "game_wordle_answers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game_wordle_answers" ADD CONSTRAINT "game_wordle_answers_id_department_fkey" FOREIGN KEY ("id_department") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
