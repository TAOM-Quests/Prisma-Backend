/*
  Warnings:

  - Added the required column `experience` to the `quest_difficulties` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quest_difficulties" ADD COLUMN     "experience" INTEGER NOT NULL;
