-- AlterTable
ALTER TABLE "quiz_reports" ADD COLUMN     "answers" TEXT,
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false;
