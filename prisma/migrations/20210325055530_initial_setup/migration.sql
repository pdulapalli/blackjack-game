-- CreateTable
CREATE TABLE `Card` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `handId` INTEGER,
    `deckId` INTEGER,
    `type` ENUM('FACECARD', 'SPOT', 'ACE') NOT NULL,
    `value` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hand` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Deck` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Participant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `handId` INTEGER NOT NULL,
    `role` ENUM('PLAYER', 'DEALER') NOT NULL,
UNIQUE INDEX `Participant_handId_unique`(`handId`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Game` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `currentTurn` ENUM('PLAYER', 'DEALER') NOT NULL,
    `winner` ENUM('PLAYER_WIN', 'DEALER_WIN', 'PENDING') NOT NULL,
    `playerId` INTEGER NOT NULL,
    `dealerId` INTEGER NOT NULL,
UNIQUE INDEX `Game_playerId_unique`(`playerId`),
UNIQUE INDEX `Game_dealerId_unique`(`dealerId`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Card` ADD FOREIGN KEY (`handId`) REFERENCES `Hand`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Card` ADD FOREIGN KEY (`deckId`) REFERENCES `Deck`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Participant` ADD FOREIGN KEY (`handId`) REFERENCES `Hand`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Game` ADD FOREIGN KEY (`playerId`) REFERENCES `Participant`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Game` ADD FOREIGN KEY (`dealerId`) REFERENCES `Participant`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;