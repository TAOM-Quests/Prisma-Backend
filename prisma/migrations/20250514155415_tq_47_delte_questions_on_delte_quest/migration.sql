-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_id_quest_fkey";

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_id_quest_fkey" FOREIGN KEY ("id_quest") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
