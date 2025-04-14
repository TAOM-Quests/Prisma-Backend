/*
  Warnings:

  - The `telegram_chat_id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "telegram_chat_id",
ADD COLUMN     "telegram_chat_id" INTEGER;
