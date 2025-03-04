-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_id_image_file_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_id_position_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id_image_file" DROP NOT NULL,
ALTER COLUMN "id_position" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_position_fkey" FOREIGN KEY ("id_position") REFERENCES "user_positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_image_file_fkey" FOREIGN KEY ("id_image_file") REFERENCES "shared_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
