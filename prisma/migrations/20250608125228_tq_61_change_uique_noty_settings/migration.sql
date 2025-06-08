/*
  Warnings:

  - The primary key for the `user_notifications_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[user_id,type_id]` on the table `user_notifications_settings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user_notifications_settings" DROP CONSTRAINT "user_notifications_settings_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "user_notifications_settings_user_id_type_id_key" ON "user_notifications_settings"("user_id", "type_id");
