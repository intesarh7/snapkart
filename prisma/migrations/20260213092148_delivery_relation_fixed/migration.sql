/*
  Warnings:

  - Added the required column `restaurantId` to the `DeliveryRule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `deliveryrule` ADD COLUMN `restaurantId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `DeliveryRule` ADD CONSTRAINT `DeliveryRule_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
