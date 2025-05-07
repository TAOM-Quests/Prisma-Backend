-- CreateTable
CREATE TABLE "event_tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "event_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_event_tagsToevents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_event_tagsToevents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_event_tagsToevents_B_index" ON "_event_tagsToevents"("B");

-- AddForeignKey
ALTER TABLE "_event_tagsToevents" ADD CONSTRAINT "_event_tagsToevents_A_fkey" FOREIGN KEY ("A") REFERENCES "event_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_event_tagsToevents" ADD CONSTRAINT "_event_tagsToevents_B_fkey" FOREIGN KEY ("B") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
