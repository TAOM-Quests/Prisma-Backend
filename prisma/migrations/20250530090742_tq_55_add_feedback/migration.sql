-- CreateTable
CREATE TABLE "feedback_forms" (
    "id" SERIAL NOT NULL,
    "entity_name" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "questions" JSONB NOT NULL,

    CONSTRAINT "feedback_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_answers" (
    "id" SERIAL NOT NULL,
    "answers" TEXT[],
    "user_id" INTEGER NOT NULL,
    "form_id" INTEGER NOT NULL,

    CONSTRAINT "feedback_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feedback_forms_entity_name_entity_id_key" ON "feedback_forms"("entity_name", "entity_id");

-- AddForeignKey
ALTER TABLE "feedback_answers" ADD CONSTRAINT "feedback_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_answers" ADD CONSTRAINT "feedback_answers_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "feedback_forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
