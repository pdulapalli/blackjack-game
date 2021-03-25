-- CreateTable
CREATE TABLE `Hand` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `spotCardsValue` INTEGER NOT NULL,
    `faceCardsValue` INTEGER NOT NULL,
    `aceCount` INTEGER NOT NULL,
    `numCardsHeld` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Participant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `currentHandId` INTEGER NOT NULL,
    `role` ENUM('PLAYER', 'DEALER') NOT NULL,
UNIQUE INDEX `Participant_currentHandId_unique`(`currentHandId`),

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
ALTER TABLE `Participant` ADD FOREIGN KEY (`currentHandId`) REFERENCES `Hand`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Game` ADD FOREIGN KEY (`playerId`) REFERENCES `Participant`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Game` ADD FOREIGN KEY (`dealerId`) REFERENCES `Participant`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;