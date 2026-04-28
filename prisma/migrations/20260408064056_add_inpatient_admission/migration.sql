-- CreateEnum
CREATE TYPE "AdmissionSource" AS ENUM ('ER', 'OPD');

-- CreateEnum
CREATE TYPE "WardType" AS ENUM ('ICU', 'GENERAL', 'PEDIATRICS', 'MATERNITY', 'SURGICAL', 'MEDICAL');

-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('ACTIVE', 'TRANSFERRED', 'DISCHARGED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DischargeType" AS ENUM ('RECOVERED', 'REFERRED', 'DAMA', 'DECEASED', 'OTHER');

-- AlterTable
ALTER TABLE "consultations" ADD COLUMN     "admissionId" TEXT;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "admissionId" TEXT;

-- CreateTable
CREATE TABLE "admissions" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dischargeDate" TIMESTAMP(3),
    "source" "AdmissionSource" NOT NULL DEFAULT 'OPD',
    "admittingDoctorId" TEXT,
    "ward" "WardType" NOT NULL,
    "bedNumber" TEXT NOT NULL,
    "status" "AdmissionStatus" NOT NULL DEFAULT 'ACTIVE',
    "dischargeType" "DischargeType",
    "dischargeSummary" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admissions_patientId_idx" ON "admissions"("patientId");

-- CreateIndex
CREATE INDEX "admissions_status_idx" ON "admissions"("status");

-- CreateIndex
CREATE INDEX "admissions_ward_idx" ON "admissions"("ward");

-- CreateIndex
CREATE INDEX "admissions_bedNumber_idx" ON "admissions"("bedNumber");

-- CreateIndex
CREATE INDEX "consultations_admissionId_idx" ON "consultations"("admissionId");

-- CreateIndex
CREATE INDEX "invoices_admissionId_idx" ON "invoices"("admissionId");

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_admittingDoctorId_fkey" FOREIGN KEY ("admittingDoctorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
