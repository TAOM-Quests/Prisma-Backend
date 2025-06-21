-- AlterTable
ALTER TABLE "answers_box_sorting" ADD COLUMN     "images_ids" INTEGER[];

-- AlterTable
ALTER TABLE "answers_connection" ADD COLUMN     "images_ids" INTEGER[];

-- AlterTable
ALTER TABLE "answers_multiple" ADD COLUMN     "images_ids" INTEGER[];

-- AlterTable
ALTER TABLE "answers_single" ADD COLUMN     "images_ids" INTEGER[];

-- CreateTable
CREATE TABLE "_answersToshared_files" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_answersToshared_files_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_answersToshared_files_B_index" ON "_answersToshared_files"("B");

-- AddForeignKey
ALTER TABLE "_answersToshared_files" ADD CONSTRAINT "_answersToshared_files_A_fkey" FOREIGN KEY ("A") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_answersToshared_files" ADD CONSTRAINT "_answersToshared_files_B_fkey" FOREIGN KEY ("B") REFERENCES "shared_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
