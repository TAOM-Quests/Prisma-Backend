/*
  Warnings:

  - A unique constraint covering the columns `[telegram]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "telegram" TEXT,
ADD COLUMN     "telegram_chat_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_key" ON "users"("telegram");
