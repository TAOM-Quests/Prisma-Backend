-- AlterTable
ALTER TABLE "quests" ADD COLUMN     "description" TEXT,
ADD COLUMN     "id_image" INTEGER,
ADD COLUMN     "time" TEXT;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_id_image_fkey" FOREIGN KEY ("id_image") REFERENCES "shared_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
