/*
  Warnings:

  - The primary key for the `user_experience` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `user_experience_source` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `source` to the `user_experience` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_experience_source" DROP CONSTRAINT "user_experience_source_department_id_fkey";

-- DropForeignKey
ALTER TABLE "user_experience_source" DROP CONSTRAINT "user_experience_source_user_id_fkey";

-- AlterTable
ALTER TABLE "user_experience" DROP CONSTRAINT "user_experience_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "source" TEXT NOT NULL,
ADD CONSTRAINT "user_experience_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "user_experience_source";
