/*
  Warnings:

  - The primary key for the `user_experience` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `user_experience` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_experience" DROP CONSTRAINT "user_experience_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "user_experience_pkey" PRIMARY KEY ("user_id", "department_id");
