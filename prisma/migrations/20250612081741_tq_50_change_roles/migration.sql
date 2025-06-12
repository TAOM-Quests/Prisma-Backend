-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_id_role_fkey";

-- CreateTable
CREATE TABLE "_user_rolesTousers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_user_rolesTousers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_user_rolesTousers_B_index" ON "_user_rolesTousers"("B");

-- AddForeignKey
ALTER TABLE "_user_rolesTousers" ADD CONSTRAINT "_user_rolesTousers_A_fkey" FOREIGN KEY ("A") REFERENCES "user_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_rolesTousers" ADD CONSTRAINT "_user_rolesTousers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
