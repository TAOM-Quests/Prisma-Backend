-- CreateTable
CREATE TABLE "user_email_confirm" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "user_email_confirm_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_email_confirm" ADD CONSTRAINT "user_email_confirm_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
