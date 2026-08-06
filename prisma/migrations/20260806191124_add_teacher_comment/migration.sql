-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_fk_student_id_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "fk_teacher_id" INTEGER,
ALTER COLUMN "fk_student_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_fk_student_id_fkey" FOREIGN KEY ("fk_student_id") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_fk_teacher_id_fkey" FOREIGN KEY ("fk_teacher_id") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
