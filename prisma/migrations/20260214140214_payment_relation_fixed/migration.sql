-- AlterTable
ALTER TABLE `payment` ADD COLUMN `bookingId` INTEGER NULL,
    ADD COLUMN `orderId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Payment_orderId_idx` ON `Payment`(`orderId`);

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
