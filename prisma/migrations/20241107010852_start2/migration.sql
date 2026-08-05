/*
  Warnings:

  - You are about to alter the column `Bio` on the `Class` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(150)`.

*/
-- AlterTable
ALTER TABLE `Class` MODIFY `Bio` VARCHAR(150) NOT NULL;

-- AlterTable
ALTER TABLE `Content` MODIFY `message` LONGTEXT NOT NULL;
