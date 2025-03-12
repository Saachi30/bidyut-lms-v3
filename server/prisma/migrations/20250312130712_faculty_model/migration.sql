-- DropIndex
DROP INDEX "quiz_reports_user_id_quiz_id_key";

-- CreateTable
CREATE TABLE "faculty_grade_enrollments" (
    "id" SERIAL NOT NULL,
    "faculty_id" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "assigned_by" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faculty_grade_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "faculty_grade_enrollments_faculty_id_grade_key" ON "faculty_grade_enrollments"("faculty_id", "grade");

-- AddForeignKey
ALTER TABLE "faculty_grade_enrollments" ADD CONSTRAINT "faculty_grade_enrollments_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_grade_enrollments" ADD CONSTRAINT "faculty_grade_enrollments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
