-- CreateTable
CREATE TABLE "answers" (
    "id" SERIAL NOT NULL,
    "id_single" INTEGER NOT NULL,
    "id_multiple" INTEGER NOT NULL,
    "id_connection" INTEGER NOT NULL,
    "id_box_sorting" INTEGER NOT NULL,
    "id_free" INTEGER NOT NULL,
    "questions_ids" INTEGER[],

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers_single" (
    "id" SERIAL NOT NULL,
    "answers" TEXT[],
    "correct_answers" INTEGER NOT NULL,
    "id_parent_answer" INTEGER NOT NULL,

    CONSTRAINT "answers_single_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers_multiple" (
    "id" SERIAL NOT NULL,
    "answers" TEXT[],
    "correct_answers" INTEGER[],
    "id_parent_answer" INTEGER NOT NULL,

    CONSTRAINT "answers_multiple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers_connection" (
    "id" SERIAL NOT NULL,
    "answers" TEXT[],
    "correct_answers" TEXT[],
    "id_parent_answer" INTEGER NOT NULL,

    CONSTRAINT "answers_connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers_box_sorting" (
    "id" SERIAL NOT NULL,
    "answers" TEXT[],
    "correct_answers" JSONB NOT NULL,
    "id_parent_answer" INTEGER NOT NULL,

    CONSTRAINT "answers_box_sorting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers_free" (
    "id" SERIAL NOT NULL,
    "correct_answers" TEXT NOT NULL,
    "id_parent_answer" INTEGER NOT NULL,

    CONSTRAINT "answers_free_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complete_quests" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_quest" INTEGER NOT NULL,

    CONSTRAINT "complete_quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "id_users" INTEGER[],
    "quest_groups_ids" INTEGER[],
    "quest_tags_ids" INTEGER[],
    "quests_ids" INTEGER[],

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "executors_ids" INTEGER[],
    "participants_ids" INTEGER[],

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quests" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL,
    "id_department" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "id_group" INTEGER NOT NULL,
    "tags_ids" INTEGER[],
    "id_difficult" INTEGER NOT NULL,
    "result_ids" INTEGER[],
    "questions_ids" INTEGER[],
    "complete_quests_ids" INTEGER[],

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_difficulties" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "quest_difficulties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "id_department" INTEGER NOT NULL,

    CONSTRAINT "quest_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_results" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "id_quest" INTEGER NOT NULL,

    CONSTRAINT "quest_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "id_department" INTEGER NOT NULL,

    CONSTRAINT "quest_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quest_tags_on_quests" (
    "id_tag" INTEGER NOT NULL,
    "id_quest" INTEGER NOT NULL,

    CONSTRAINT "quest_tags_on_quests_pkey" PRIMARY KEY ("id_quest","id_tag")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "id_quest" INTEGER NOT NULL,
    "id_type" INTEGER NOT NULL,
    "id_answer" INTEGER NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "questions_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "id_role" INTEGER NOT NULL,
    "id_department" INTEGER NOT NULL,
    "events_where_executor_ids" INTEGER[],
    "events_where_participant_ids" INTEGER[],

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_executors_on_events" (
    "id_executor" INTEGER NOT NULL,
    "id_event" INTEGER NOT NULL,

    CONSTRAINT "user_executors_on_events_pkey" PRIMARY KEY ("id_event","id_executor")
);

-- CreateTable
CREATE TABLE "user_participants_on_events" (
    "id_participant" INTEGER NOT NULL,
    "id_event" INTEGER NOT NULL,

    CONSTRAINT "user_participants_on_events_pkey" PRIMARY KEY ("id_event","id_participant")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "answers_single_id_parent_answer_key" ON "answers_single"("id_parent_answer");

-- CreateIndex
CREATE UNIQUE INDEX "answers_multiple_id_parent_answer_key" ON "answers_multiple"("id_parent_answer");

-- CreateIndex
CREATE UNIQUE INDEX "answers_connection_id_parent_answer_key" ON "answers_connection"("id_parent_answer");

-- CreateIndex
CREATE UNIQUE INDEX "answers_box_sorting_id_parent_answer_key" ON "answers_box_sorting"("id_parent_answer");

-- CreateIndex
CREATE UNIQUE INDEX "answers_free_id_parent_answer_key" ON "answers_free"("id_parent_answer");

-- AddForeignKey
ALTER TABLE "answers_single" ADD CONSTRAINT "answers_single_id_parent_answer_fkey" FOREIGN KEY ("id_parent_answer") REFERENCES "answers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers_multiple" ADD CONSTRAINT "answers_multiple_id_parent_answer_fkey" FOREIGN KEY ("id_parent_answer") REFERENCES "answers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers_connection" ADD CONSTRAINT "answers_connection_id_parent_answer_fkey" FOREIGN KEY ("id_parent_answer") REFERENCES "answers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers_box_sorting" ADD CONSTRAINT "answers_box_sorting_id_parent_answer_fkey" FOREIGN KEY ("id_parent_answer") REFERENCES "answers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers_free" ADD CONSTRAINT "answers_free_id_parent_answer_fkey" FOREIGN KEY ("id_parent_answer") REFERENCES "answers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complete_quests" ADD CONSTRAINT "complete_quests_id_quest_fkey" FOREIGN KEY ("id_quest") REFERENCES "quests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complete_quests" ADD CONSTRAINT "complete_quests_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_id_department_fkey" FOREIGN KEY ("id_department") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_id_difficult_fkey" FOREIGN KEY ("id_difficult") REFERENCES "quest_difficulties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_id_group_fkey" FOREIGN KEY ("id_group") REFERENCES "quest_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_groups" ADD CONSTRAINT "quest_groups_id_department_fkey" FOREIGN KEY ("id_department") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_results" ADD CONSTRAINT "quest_results_id_quest_fkey" FOREIGN KEY ("id_quest") REFERENCES "quests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_tags" ADD CONSTRAINT "quest_tags_id_department_fkey" FOREIGN KEY ("id_department") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_tags_on_quests" ADD CONSTRAINT "quest_tags_on_quests_id_quest_fkey" FOREIGN KEY ("id_quest") REFERENCES "quests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quest_tags_on_quests" ADD CONSTRAINT "quest_tags_on_quests_id_tag_fkey" FOREIGN KEY ("id_tag") REFERENCES "quest_tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_id_answer_fkey" FOREIGN KEY ("id_answer") REFERENCES "answers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_id_quest_fkey" FOREIGN KEY ("id_quest") REFERENCES "quests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_id_type_fkey" FOREIGN KEY ("id_type") REFERENCES "questions_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_department_fkey" FOREIGN KEY ("id_department") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_executors_on_events" ADD CONSTRAINT "user_executors_on_events_id_event_fkey" FOREIGN KEY ("id_event") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_executors_on_events" ADD CONSTRAINT "user_executors_on_events_id_executor_fkey" FOREIGN KEY ("id_executor") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_participants_on_events" ADD CONSTRAINT "user_participants_on_events_id_event_fkey" FOREIGN KEY ("id_event") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_participants_on_events" ADD CONSTRAINT "user_participants_on_events_id_participant_fkey" FOREIGN KEY ("id_participant") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
