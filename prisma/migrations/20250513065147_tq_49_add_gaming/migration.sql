-- AlterTable
ALTER TABLE "users" ADD COLUMN     "level_number" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "user_levels" (
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,

    CONSTRAINT "user_levels_pkey" PRIMARY KEY ("level")
);

-- CreateTable
CREATE TABLE "user_experience" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "experience" INTEGER NOT NULL,

    CONSTRAINT "user_experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "image_id" INTEGER NOT NULL,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_user_achievementsTousers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_user_achievementsTousers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_user_achievementsTousers_B_index" ON "_user_achievementsTousers"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_level_number_fkey" FOREIGN KEY ("level_number") REFERENCES "user_levels"("level") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_experience" ADD CONSTRAINT "user_experience_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_experience" ADD CONSTRAINT "user_experience_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "shared_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_achievementsTousers" ADD CONSTRAINT "_user_achievementsTousers_A_fkey" FOREIGN KEY ("A") REFERENCES "user_achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_achievementsTousers" ADD CONSTRAINT "_user_achievementsTousers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
