/*
  Warnings:

  - You are about to drop the column `score` on the `Participant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Game` ADD COLUMN     `playerScore` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN     `dealerScore` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Participant` DROP COLUMN `score`;