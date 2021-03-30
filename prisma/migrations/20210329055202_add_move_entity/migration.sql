-- CreateTable
CREATE TABLE `Move` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action` ENUM('HIT', 'STAY') NOT NULL,
    `participantId` INTEGER NOT NULL,
    `gameId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Move` ADD FOREIGN KEY (`participantId`) REFERENCES `Participant`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Move` ADD FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;