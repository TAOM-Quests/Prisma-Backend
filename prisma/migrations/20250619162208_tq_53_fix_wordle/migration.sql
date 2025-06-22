/*
  Warnings:

  - You are about to drop the `game_wordle_words_attempts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "game_wordle_words_attempts" DROP CONSTRAINT "game_wordle_words_attempts_user_id_fkey";

-- DropTable
DROP TABLE "game_wordle_words_attempts";

-- CreateTable
CREATE TABLE "game_wordle_attempts" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "word" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "game_wordle_attempts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game_wordle_attempts" ADD CONSTRAINT "game_wordle_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
