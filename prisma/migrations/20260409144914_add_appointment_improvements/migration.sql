-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('INITIAL', 'FOLLOW_UP', 'REVIEW', 'PROCEDURE', 'OTHER');

-- CreateEnum
CREATE TYPE "AppointmentPriority" AS ENUM ('ROUTINE', 'URGENT', 'EMERGENCY');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "doctorId" TEXT,
ADD COLUMN     "doctorName" TEXT,
ADD COLUMN     "priority" "AppointmentPriority" NOT NULL DEFAULT 'ROUTINE',
ADD COLUMN     "type" "AppointmentType" NOT NULL DEFAULT 'FOLLOW_UP';

-- CreateIndex
CREATE INDEX "appointments_doctorId_idx" ON "appointments"("doctorId");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
