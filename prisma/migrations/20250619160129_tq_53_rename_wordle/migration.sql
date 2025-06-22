/*
  Warnings:

  - You are about to drop the `game_wordle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `game_wordle_answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `game_wordle_attempts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "game_wordle_words" DROP CONSTRAINT "game_wordle_words_department_id_fkey";

-- DropForeignKey
ALTER TABLE "game_wordle_answers" DROP CONSTRAINT "game_wordle_answers_department_id_fkey";

-- DropForeignKey
ALTER TABLE "game_wordle_attempts" DROP CONSTRAINT "game_wordle_attempts_user_id_fkey";

-- DropTable
DROP TABLE "game_wordle_words";

-- DropTable
DROP TABLE "game_wordle_answers";

-- DropTable
DROP TABLE "game_wordle_attempts";

-- CreateTable
CREATE TABLE "game_wordle_words" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "word" TEXT NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "game_wordle_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_wordle_words_answers" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "word" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "game_wordle_words_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_wordle_words_attempts" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "word" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "game_wordle_words_attempts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game_wordle_words" ADD CONSTRAINT "game_wordle_words_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_wordle_words_answers" ADD CONSTRAINT "game_wordle_words_answers_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_wordle_words_attempts" ADD CONSTRAINT "game_wordle_words_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
