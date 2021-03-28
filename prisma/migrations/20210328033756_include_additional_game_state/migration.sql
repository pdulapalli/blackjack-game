/*
  Warnings:

  - You are about to drop the column `winner` on the `Game` table. All the data in the column will be lost.
  - The migration will add a unique constraint covering the columns `[deckId]` on the table `Game`. If there are existing duplicate values, the migration will fail.
  - Added the required column `deckId` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Game` DROP COLUMN `winner`,
    ADD COLUMN     `outcome` ENUM('PLAYER_WIN', 'DEALER_WIN', 'PENDING') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN     `deckId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Game_deckId_unique` ON `Game`(`deckId`);

-- AddForeignKey
ALTER TABLE `Game` ADD FOREIGN KEY (`deckId`) REFERENCES `Collection`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;