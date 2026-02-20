-- CreateTable
CREATE TABLE `WebsiteSetting` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contactNumber` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `facebook` VARCHAR(191) NULL,
    `instagram` VARCHAR(191) NULL,
    `twitter` VARCHAR(191) NULL,
    `youtube` VARCHAR(191) NULL,
    `headerLogo` VARCHAR(191) NULL,
    `footerLogo` VARCHAR(191) NULL,
    `footerInfo` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
