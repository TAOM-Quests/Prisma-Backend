/*
  Warnings:

  - Added the required column `id_department` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_id_image_file_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_id_inspector_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_id_type_fkey";

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "id_department" INTEGER NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "date" DROP NOT NULL,
ALTER COLUMN "id_image_file" DROP NOT NULL,
ALTER COLUMN "id_inspector" DROP NOT NULL,
ALTER COLUMN "id_status" SET DEFAULT 1,
ALTER COLUMN "id_type" DROP NOT NULL,
ALTER COLUMN "seats_number" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_id_department_fkey" FOREIGN KEY ("id_department") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_id_type_fkey" FOREIGN KEY ("id_type") REFERENCES "event_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_id_image_file_fkey" FOREIGN KEY ("id_image_file") REFERENCES "shared_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_id_inspector_fkey" FOREIGN KEY ("id_inspector") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
