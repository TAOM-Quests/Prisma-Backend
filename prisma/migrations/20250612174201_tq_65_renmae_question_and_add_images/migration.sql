/*
  Warnings:

  - You are about to drop the column `questions` on the `feedback_forms` table. All the data in the column will be lost.
  - You are about to drop the `_answersToshared_files` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_answersToshared_files" DROP CONSTRAINT "_answersToshared_files_A_fkey";

-- DropForeignKey
ALTER TABLE "_answersToshared_files" DROP CONSTRAINT "_answersToshared_files_B_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_id_answer_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_id_quest_fkey";

-- AlterTable
ALTER TABLE "feedback_forms" DROP COLUMN "questions",
ADD COLUMN     "quest_questions" JSONB[];

-- DropTable
DROP TABLE "_answersToshared_files";

-- DropTable
DROP TABLE "questions";

-- CreateTable
CREATE TABLE "quest_questions" (
    "id" SERIAL NOT NULL,
    "text" TEXT,
    "type" TEXT,
    "id_quest" INTEGER NOT NULL,
    "id_answer" INTEGER,

    CONSTRAINT "quest_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_quest_questionsToshared_files" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_quest_questionsToshared_files_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_quest_questionsToshared_files_B_index" ON "_quest_questionsToshared_files"("B");

-- AddForeignKey
ALTER TABLE "quest_questions" ADD CONSTRAINT "quest_questions_id_answer_fkey" FOREIGN KEY ("id_answer") REFERENCES "answers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_questions" ADD CONSTRAINT "quest_questions_id_quest_fkey" FOREIGN KEY ("id_quest") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_quest_questionsToshared_files" ADD CONSTRAINT "_quest_questionsToshared_files_A_fkey" FOREIGN KEY ("A") REFERENCES "quest_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_quest_questionsToshared_files" ADD CONSTRAINT "_quest_questionsToshared_files_B_fkey" FOREIGN KEY ("B") REFERENCES "shared_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
