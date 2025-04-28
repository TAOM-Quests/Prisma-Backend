/*
  Warnings:

  - You are about to drop the column `id_type` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the `questions_types` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_id_type_fkey";

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "id_type",
ADD COLUMN     "type" TEXT;

-- DropTable
DROP TABLE "questions_types";
