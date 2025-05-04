/*
  Warnings:

  - You are about to drop the column `executors_ids` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `files_ids` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `participants_ids` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `events_where_executor_ids` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `events_where_participant_ids` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "executors_ids",
DROP COLUMN "files_ids",
DROP COLUMN "participants_ids";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "events_where_executor_ids",
DROP COLUMN "events_where_participant_ids";
