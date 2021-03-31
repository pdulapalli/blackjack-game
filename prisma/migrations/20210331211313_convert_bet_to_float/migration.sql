/*
  Warnings:

  - You are about to alter the column `bet` on the `Game` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Game` MODIFY `bet` DOUBLE NOT NULL DEFAULT 0.00;