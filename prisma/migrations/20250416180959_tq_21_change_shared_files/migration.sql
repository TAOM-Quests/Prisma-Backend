/*
  Warnings:

  - Added the required column `original_name` to the `shared_files` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `size` on the `shared_files` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "shared_files" ADD COLUMN     "original_name" TEXT NOT NULL,
DROP COLUMN "size",
ADD COLUMN     "size" INTEGER NOT NULL;
