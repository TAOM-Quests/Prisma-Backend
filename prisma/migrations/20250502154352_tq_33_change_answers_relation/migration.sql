/*
  Warnings:

  - You are about to drop the column `id_parent_answer` on the `answers_box_sorting` table. All the data in the column will be lost.
  - You are about to drop the column `id_parent_answer` on the `answers_connection` table. All the data in the column will be lost.
  - You are about to drop the column `id_parent_answer` on the `answers_free` table. All the data in the column will be lost.
  - You are about to drop the column `id_parent_answer` on the `answers_multiple` table. All the data in the column will be lost.
  - You are about to drop the column `id_parent_answer` on the `answers_single` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "answers_box_sorting" DROP CONSTRAINT "answers_box_sorting_id_parent_answer_fkey";

-- DropForeignKey
ALTER TABLE "answers_connection" DROP CONSTRAINT "answers_connection_id_parent_answer_fkey";

-- DropForeignKey
ALTER TABLE "answers_free" DROP CONSTRAINT "answers_free_id_parent_answer_fkey";

-- DropForeignKey
ALTER TABLE "answers_multiple" DROP CONSTRAINT "answers_multiple_id_parent_answer_fkey";

-- DropForeignKey
ALTER TABLE "answers_single" DROP CONSTRAINT "answers_single_id_parent_answer_fkey";

-- DropIndex
DROP INDEX "answers_box_sorting_id_parent_answer_key";

-- DropIndex
DROP INDEX "answers_connection_id_parent_answer_key";

-- DropIndex
DROP INDEX "answers_free_id_parent_answer_key";

-- DropIndex
DROP INDEX "answers_multiple_id_parent_answer_key";

-- DropIndex
DROP INDEX "answers_single_id_parent_answer_key";

-- AlterTable
ALTER TABLE "answers_box_sorting" DROP COLUMN "id_parent_answer";

-- AlterTable
ALTER TABLE "answers_connection" DROP COLUMN "id_parent_answer";

-- AlterTable
ALTER TABLE "answers_free" DROP COLUMN "id_parent_answer";

-- AlterTable
ALTER TABLE "answers_multiple" DROP COLUMN "id_parent_answer";

-- AlterTable
ALTER TABLE "answers_single" DROP COLUMN "id_parent_answer";

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_id_single_fkey" FOREIGN KEY ("id_single") REFERENCES "answers_single"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_id_multiple_fkey" FOREIGN KEY ("id_multiple") REFERENCES "answers_multiple"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_id_connection_fkey" FOREIGN KEY ("id_connection") REFERENCES "answers_connection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_id_box_sorting_fkey" FOREIGN KEY ("id_box_sorting") REFERENCES "answers_box_sorting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_id_free_fkey" FOREIGN KEY ("id_free") REFERENCES "answers_free"("id") ON DELETE SET NULL ON UPDATE CASCADE;
