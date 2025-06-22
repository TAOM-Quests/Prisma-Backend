/*
  Warnings:

  - Added the required column `description` to the `departments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_image` to the `departments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "id_image" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_id_image_fkey" FOREIGN KEY ("id_image") REFERENCES "shared_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
