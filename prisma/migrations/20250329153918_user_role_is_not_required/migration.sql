-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_id_role_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id_role" DROP NOT NULL,
ALTER COLUMN "id_role" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
