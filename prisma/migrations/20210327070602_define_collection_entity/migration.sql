/*
  Warnings:

  - You are about to drop the column `handId` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `deckId` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the `Deck` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Hand` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Card` DROP FOREIGN KEY `Card_ibfk_2`;

-- DropForeignKey
ALTER TABLE `Card` DROP FOREIGN KEY `Card_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Participant` DROP FOREIGN KEY `Participant_ibfk_1`;

-- AlterTable
ALTER TABLE `Card` DROP COLUMN `handId`,
    DROP COLUMN `deckId`,
    ADD COLUMN     `collectionId` INTEGER;

-- DropTable
DROP TABLE `Deck`;

-- DropTable
DROP TABLE `Hand`;

-- CreateTable
CREATE TABLE `Collection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('DECK', 'HAND') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Card` ADD FOREIGN KEY (`collectionId`) REFERENCES `Collection`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Participant` ADD FOREIGN KEY (`handId`) REFERENCES `Collection`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;