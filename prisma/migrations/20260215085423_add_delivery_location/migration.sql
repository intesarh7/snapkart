-- AlterTable
ALTER TABLE `user` ADD COLUMN `lastLocationUpdate` DATETIME(3) NULL,
    ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL;
