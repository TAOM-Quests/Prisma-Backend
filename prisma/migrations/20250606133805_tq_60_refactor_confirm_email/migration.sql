/*
  Warnings:

  - You are about to drop the column `user_id` on the `user_email_confirm` table. All the data in the column will be lost.
  - Added the required column `code` to the `user_email_confirm` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_email_confirm" DROP CONSTRAINT "user_email_confirm_user_id_fkey";

-- AlterTable
ALTER TABLE "user_email_confirm" DROP COLUMN "user_id",
ADD COLUMN     "code" INTEGER NOT NULL;
