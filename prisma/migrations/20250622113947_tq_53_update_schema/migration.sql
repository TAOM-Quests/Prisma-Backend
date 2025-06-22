/*
  Warnings:

  - A unique constraint covering the columns `[word,department_id]` on the table `game_wordle_words` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `department_id` to the `game_wordle_attempts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "feedback_answers" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "feedback_forms" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "game_wordle_attempts" ADD COLUMN     "department_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "quest_questions" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "user_notifications_settings" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "user_notifications_types" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "id_role" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "game_wordle_words_word_department_id_key" ON "game_wordle_words"("word", "department_id");

-- AddForeignKey
ALTER TABLE "game_wordle_attempts" ADD CONSTRAINT "game_wordle_attempts_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
