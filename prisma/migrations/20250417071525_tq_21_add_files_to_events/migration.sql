-- AlterTable
ALTER TABLE "events" ADD COLUMN     "files_ids" INTEGER[];

-- CreateTable
CREATE TABLE "shared_files_on_events" (
    "id_event" INTEGER NOT NULL,
    "id_file" INTEGER NOT NULL,

    CONSTRAINT "shared_files_on_events_pkey" PRIMARY KEY ("id_event","id_file")
);

-- AddForeignKey
ALTER TABLE "shared_files_on_events" ADD CONSTRAINT "shared_files_on_events_id_event_fkey" FOREIGN KEY ("id_event") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_files_on_events" ADD CONSTRAINT "shared_files_on_events_id_file_fkey" FOREIGN KEY ("id_file") REFERENCES "shared_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
