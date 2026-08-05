/*
  Warnings:

  - Added the required column `password` to the `Person` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Class` MODIFY `Bio` VARCHAR(150) NULL;

-- AlterTable
ALTER TABLE `Content` ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'tarefa',
    MODIFY `url` VARCHAR(191) NULL,
    MODIFY `subTitle` VARCHAR(191) NULL,
    MODIFY `observation` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Performs` ADD COLUMN `answer` LONGTEXT NULL,
    ADD COLUMN `score` DECIMAL(65, 30) NULL;

-- AlterTable
ALTER TABLE `Person` ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'student',
    ADD COLUMN `url_avatar` VARCHAR(191) NULL,
    MODIFY `phone` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Student` MODIFY `active` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `bio` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Teacher` MODIFY `active` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `bio` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Test` ADD COLUMN `timer_minutes` INTEGER NOT NULL DEFAULT 60,
    MODIFY `score` DECIMAL(65, 30) NULL,
    MODIFY `observation` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Comment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `message` LONGTEXT NOT NULL,
    `fk_student_id` INTEGER NOT NULL,
    `fk_content_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_fk_student_id_fkey` FOREIGN KEY (`fk_student_id`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_fk_content_id_fkey` FOREIGN KEY (`fk_content_id`) REFERENCES `Content`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
