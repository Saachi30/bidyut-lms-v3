/*
  Warnings:

  - You are about to drop the `quiz_invitations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_course_enrollments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `grade_id` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "quiz_invitations" DROP CONSTRAINT "quiz_invitations_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_invitations" DROP CONSTRAINT "quiz_invitations_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_invitations" DROP CONSTRAINT "quiz_invitations_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "student_course_enrollments" DROP CONSTRAINT "student_course_enrollments_assigned_by_fkey";

-- DropForeignKey
ALTER TABLE "student_course_enrollments" DROP CONSTRAINT "student_course_enrollments_course_id_fkey";

-- DropForeignKey
ALTER TABLE "student_course_enrollments" DROP CONSTRAINT "student_course_enrollments_student_id_fkey";

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "grade_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "institutes" ADD COLUMN     "maxGrades" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxStudents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "grade" TEXT;

-- DropTable
DROP TABLE "quiz_invitations";

-- DropTable
DROP TABLE "student_course_enrollments";

-- DropEnum
DROP TYPE "InvitationStatus";

-- CreateTable
CREATE TABLE "grades" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "institute_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_grade_enrollments" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "grade_id" INTEGER NOT NULL,
    "assigned_by" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_grade_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_codes" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "created_by" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_grade_enrollments_student_id_grade_id_key" ON "student_grade_enrollments"("student_id", "grade_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_codes_code_key" ON "quiz_codes"("code");

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_institute_id_fkey" FOREIGN KEY ("institute_id") REFERENCES "institutes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_grade_enrollments" ADD CONSTRAINT "student_grade_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_grade_enrollments" ADD CONSTRAINT "student_grade_enrollments_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_grade_enrollments" ADD CONSTRAINT "student_grade_enrollments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_codes" ADD CONSTRAINT "quiz_codes_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_codes" ADD CONSTRAINT "quiz_codes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
