/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_id_department_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "surname" DROP NOT NULL,
ALTER COLUMN "id_role" SET DEFAULT 1,
ALTER COLUMN "id_department" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_department_fkey" FOREIGN KEY ("id_department") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
