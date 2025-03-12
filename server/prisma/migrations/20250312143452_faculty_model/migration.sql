/*
  Warnings:

  - You are about to drop the `faculty_grade_enrollments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_grade_enrollments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "faculty_grade_enrollments" DROP CONSTRAINT "faculty_grade_enrollments_assigned_by_fkey";

-- DropForeignKey
ALTER TABLE "faculty_grade_enrollments" DROP CONSTRAINT "faculty_grade_enrollments_faculty_id_fkey";

-- DropForeignKey
ALTER TABLE "student_grade_enrollments" DROP CONSTRAINT "student_grade_enrollments_assigned_by_fkey";

-- DropForeignKey
ALTER TABLE "student_grade_enrollments" DROP CONSTRAINT "student_grade_enrollments_student_id_fkey";

-- DropTable
DROP TABLE "faculty_grade_enrollments";

-- DropTable
DROP TABLE "student_grade_enrollments";

-- CreateTable
CREATE TABLE "course_enrollments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_user_id_course_id_key" ON "course_enrollments"("user_id", "course_id");

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
