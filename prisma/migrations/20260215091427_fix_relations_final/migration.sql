-- CreateTable
CREATE TABLE `DeliveryEarning` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `deliveryBoyId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DeliveryEarning` ADD CONSTRAINT `DeliveryEarning_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryEarning` ADD CONSTRAINT `DeliveryEarning_deliveryBoyId_fkey` FOREIGN KEY (`deliveryBoyId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
