-- CreateTable
CREATE TABLE "game_wordle" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "is_today_word" BOOLEAN NOT NULL,
    "id_department" INTEGER NOT NULL,

    CONSTRAINT "game_wordle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_wordle_attempts" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "game_wordle_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_experience_source" (
    "id" SERIAL NOT NULL,
    "experience" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "user_experience_source_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game_wordle" ADD CONSTRAINT "game_wordle_id_department_fkey" FOREIGN KEY ("id_department") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_wordle_attempts" ADD CONSTRAINT "game_wordle_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_experience_source" ADD CONSTRAINT "user_experience_source_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
