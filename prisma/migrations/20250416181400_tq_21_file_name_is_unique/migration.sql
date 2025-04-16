/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `shared_files` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "shared_files_name_key" ON "shared_files"("name");
