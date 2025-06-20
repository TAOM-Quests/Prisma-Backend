/*
  Warnings:

  - You are about to drop the column `settings` on the `user_notifications_settings` table. All the data in the column will be lost.
  - Added the required column `email` to the `user_notifications_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telegram` to the `user_notifications_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type_id` to the `user_notifications_settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_notifications_settings" DROP COLUMN "settings",
ADD COLUMN     "email" BOOLEAN NOT NULL,
ADD COLUMN     "telegram" BOOLEAN NOT NULL,
ADD COLUMN     "type_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "user_notifications_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "user_notifications_types_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_notifications_settings" ADD CONSTRAINT "user_notifications_settings_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "user_notifications_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
