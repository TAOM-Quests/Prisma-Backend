/*
  Warnings:

  - You are about to drop the column `answers` on the `answers_box_sorting` table. All the data in the column will be lost.
  - You are about to drop the column `answers` on the `answers_connection` table. All the data in the column will be lost.
  - You are about to drop the column `answers` on the `answers_multiple` table. All the data in the column will be lost.
  - You are about to drop the column `answers` on the `answers_single` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "answers_box_sorting" DROP COLUMN "answers",
ADD COLUMN     "options" TEXT[];

-- AlterTable
ALTER TABLE "answers_connection" DROP COLUMN "answers",
ADD COLUMN     "options" TEXT[];

-- AlterTable
ALTER TABLE "answers_multiple" DROP COLUMN "answers",
ADD COLUMN     "options" TEXT[];

-- AlterTable
ALTER TABLE "answers_single" DROP COLUMN "answers",
ADD COLUMN     "options" TEXT[];
