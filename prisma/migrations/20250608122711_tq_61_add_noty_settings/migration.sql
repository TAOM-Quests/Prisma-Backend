-- CreateTable
CREATE TABLE "user_notifications_settings" (
    "settings" JSONB NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "user_notifications_settings_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "user_notifications_settings" ADD CONSTRAINT "user_notifications_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
