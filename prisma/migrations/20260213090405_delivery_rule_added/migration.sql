-- CreateTable
CREATE TABLE `DeliveryRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `minOrder` DOUBLE NOT NULL,
    `maxOrder` DOUBLE NULL,
    `minDistance` DOUBLE NOT NULL,
    `maxDistance` DOUBLE NULL,
    `chargeType` ENUM('FREE', 'FLAT') NOT NULL,
    `chargeAmount` DOUBLE NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
