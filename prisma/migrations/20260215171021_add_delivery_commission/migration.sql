/*
  Warnings:

  - You are about to drop the column `amount` on the `deliveryearning` table. All the data in the column will be lost.
  - Added the required column `earningAmount` to the `DeliveryEarning` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderAmount` to the `DeliveryEarning` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `deliveryearning` DROP COLUMN `amount`,
    ADD COLUMN `earningAmount` DOUBLE NOT NULL,
    ADD COLUMN `orderAmount` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `commissionType` VARCHAR(191) NULL,
    ADD COLUMN `commissionValue` DOUBLE NULL;
