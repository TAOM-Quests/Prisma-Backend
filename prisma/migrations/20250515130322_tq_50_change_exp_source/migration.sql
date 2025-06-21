/*
  Warnings:

  - You are about to drop the column `id_department` on the `game_wordle` table. All the data in the column will be lost.
  - You are about to drop the column `id_department` on the `game_wordle_answers` table. All the data in the column will be lost.
  - Added the required column `department_id` to the `game_wordle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department_id` to the `game_wordle_answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department_id` to the `user_experience_source` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "game_wordle" DROP CONSTRAINT "game_wordle_id_department_fkey";

-- DropForeignKey
ALTER TABLE "game_wordle_answers" DROP CONSTRAINT "game_wordle_answers_id_department_fkey";

-- AlterTable
ALTER TABLE "game_wordle" DROP COLUMN "id_department",
ADD COLUMN     "department_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "game_wordle_answers" DROP COLUMN "id_department",
ADD COLUMN     "department_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user_experience_source" ADD COLUMN     "department_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "game_wordle" ADD CONSTRAINT "game_wordle_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_wordle_answers" ADD CONSTRAINT "game_wordle_answers_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_experience_source" ADD CONSTRAINT "user_experience_source_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
