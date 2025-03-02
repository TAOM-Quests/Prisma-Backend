/*
  Warnings:

  - You are about to drop the column `id_quest` on the `complete_quests` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `quests` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `surname` on the `users` table. All the data in the column will be lost.
  - Added the required column `quest_data` to the `complete_quests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_image_file` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_inspector` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_status` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_type` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seats_number` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `user_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birth_date` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_image_file` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_position` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patronymic` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sex` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "user_sex" AS ENUM ('MALE', 'FEMALE');

-- DropForeignKey
ALTER TABLE "complete_quests" DROP CONSTRAINT "complete_quests_id_quest_fkey";

-- AlterTable
ALTER TABLE "complete_quests" DROP COLUMN "id_quest",
ADD COLUMN     "quest_data" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "id_image_file" INTEGER NOT NULL,
ADD COLUMN     "id_inspector" INTEGER NOT NULL,
ADD COLUMN     "id_status" INTEGER NOT NULL,
ADD COLUMN     "id_type" INTEGER NOT NULL,
ADD COLUMN     "places" JSONB[],
ADD COLUMN     "seats_number" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "quests" DROP COLUMN "version";

-- AlterTable
ALTER TABLE "user_roles" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
DROP COLUMN "surname",
ADD COLUMN     "birth_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "id_image_file" INTEGER NOT NULL,
ADD COLUMN     "id_position" INTEGER NOT NULL,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "patronymic" TEXT NOT NULL,
ADD COLUMN     "phone_number" TEXT NOT NULL,
ADD COLUMN     "sex" "user_sex" NOT NULL;

-- CreateTable
CREATE TABLE "event_statuses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "event_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "event_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_files" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "shared_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_positions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "user_positions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_id_inspector_fkey" FOREIGN KEY ("id_inspector") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_id_status_fkey" FOREIGN KEY ("id_status") REFERENCES "event_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_id_type_fkey" FOREIGN KEY ("id_type") REFERENCES "event_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_id_image_file_fkey" FOREIGN KEY ("id_image_file") REFERENCES "shared_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_position_fkey" FOREIGN KEY ("id_position") REFERENCES "user_positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_image_file_fkey" FOREIGN KEY ("id_image_file") REFERENCES "shared_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
