-- CreateTable
CREATE TABLE "game_crossword_words" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "id_difficulty" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "game_crossword_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_crossword_difficulties" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,

    CONSTRAINT "game_crossword_difficulties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_crossword_answers" (
    "id" SERIAL NOT NULL,
    "day" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "word" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,

    CONSTRAINT "game_crossword_answers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game_crossword_words" ADD CONSTRAINT "game_crossword_words_id_difficulty_fkey" FOREIGN KEY ("id_difficulty") REFERENCES "game_crossword_difficulties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_crossword_words" ADD CONSTRAINT "game_crossword_words_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_crossword_answers" ADD CONSTRAINT "game_crossword_answers_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
