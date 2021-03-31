/*
  Warnings:

  - You are about to alter the column `money` on the `Participant` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Participant` MODIFY `money` DOUBLE NOT NULL DEFAULT 0.00;