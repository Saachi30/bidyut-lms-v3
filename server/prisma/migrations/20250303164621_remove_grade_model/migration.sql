/*
  Warnings:

  - You are about to drop the column `grade_id` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `grade_id` on the `student_grade_enrollments` table. All the data in the column will be lost.
  - You are about to drop the `grades` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[student_id,grade]` on the table `student_grade_enrollments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `grade` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grade` to the `student_grade_enrollments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_grade_id_fkey";

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT "grades_institute_id_fkey";

-- DropForeignKey
ALTER TABLE "student_grade_enrollments" DROP CONSTRAINT "student_grade_enrollments_grade_id_fkey";

-- DropIndex
DROP INDEX "student_grade_enrollments_student_id_grade_id_key";

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "grade_id",
ADD COLUMN     "grade" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "student_grade_enrollments" DROP COLUMN "grade_id",
ADD COLUMN     "grade" TEXT NOT NULL;

-- DropTable
DROP TABLE "grades";

-- CreateIndex
CREATE UNIQUE INDEX "student_grade_enrollments_student_id_grade_key" ON "student_grade_enrollments"("student_id", "grade");
