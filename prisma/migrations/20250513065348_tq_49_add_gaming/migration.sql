-- AlterTable
CREATE SEQUENCE user_levels_level_seq;
ALTER TABLE "user_levels" ALTER COLUMN "level" SET DEFAULT nextval('user_levels_level_seq');
ALTER SEQUENCE user_levels_level_seq OWNED BY "user_levels"."level";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "level_number" SET DEFAULT 1;
