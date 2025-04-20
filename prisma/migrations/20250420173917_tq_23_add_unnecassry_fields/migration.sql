-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_id_answer_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_id_type_fkey";

-- AlterTable
ALTER TABLE "answers" ALTER COLUMN "id_single" DROP NOT NULL,
ALTER COLUMN "id_multiple" DROP NOT NULL,
ALTER COLUMN "id_connection" DROP NOT NULL,
ALTER COLUMN "id_box_sorting" DROP NOT NULL,
ALTER COLUMN "id_free" DROP NOT NULL;

-- AlterTable
ALTER TABLE "answers_box_sorting" ALTER COLUMN "correct_answers" DROP NOT NULL;

-- AlterTable
ALTER TABLE "answers_free" ALTER COLUMN "correct_answers" DROP NOT NULL;

-- AlterTable
ALTER TABLE "answers_single" ALTER COLUMN "correct_answers" DROP NOT NULL;

-- AlterTable
ALTER TABLE "questions" ALTER COLUMN "id_type" DROP NOT NULL,
ALTER COLUMN "id_answer" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_id_answer_fkey" FOREIGN KEY ("id_answer") REFERENCES "answers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_id_type_fkey" FOREIGN KEY ("id_type") REFERENCES "questions_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
