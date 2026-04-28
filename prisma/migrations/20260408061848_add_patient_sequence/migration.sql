-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'RECEPTION', 'TRIAGE', 'SPECIALIST', 'LABORATORY', 'RADIOLOGY', 'BILLING', 'FINANCIAL');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('LABORATORY', 'INPATIENT', 'CONSULTATION', 'PROCEDURE', 'PHARMACY', 'RADIOLOGY', 'AMBULANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "BillingMethod" AS ENUM ('FIXED', 'PER_DAY', 'HOURLY', 'PACKAGE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'IN_TRIAGE', 'TRIAGED', 'EMERGENCY', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'ARRIVED', 'CANCELLED', 'COMPLETED', 'NOSHOW');

-- CreateEnum
CREATE TYPE "LabRequestStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LabTestCategory" AS ENUM ('HEMATOLOGY', 'SEROLOGY', 'CHEMISTRY', 'URINALYSIS', 'MICROBIOLOGY', 'HORMONAL', 'COAGULATION', 'OTHERS');

-- CreateEnum
CREATE TYPE "RadiologyRequestStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateTable
CREATE TABLE "patient_sequences" (
    "id" TEXT NOT NULL,
    "loc" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "lastSeq" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "patient_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'RECEPTION',
    "specialty" TEXT,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastFailedLogin" TIMESTAMP(3),
    "currentSessionToken" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIP" TEXT,
    "lastLoginUserAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "mrn" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "ageUnit" TEXT DEFAULT 'years',
    "sex" TEXT,
    "gender" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "phoneNumber" TEXT,
    "email" TEXT,
    "address" TEXT,
    "region" TEXT DEFAULT 'Addis Ababa',
    "zoneSubcity" TEXT,
    "woreda" TEXT,
    "emergencyName" TEXT,
    "emergencyPhone" TEXT,
    "emergencyRel" TEXT,
    "lastDiagnosis" TEXT,
    "lastSummary" TEXT,
    "lastVisitDate" TIMESTAMP(3),
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdById" TEXT,
    "vitals" JSONB,
    "chiefComplaint" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "clinicalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "triages" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "pulse" INTEGER,
    "respiratoryRate" INTEGER,
    "bloodPressure" TEXT,
    "spo2" INTEGER,
    "weight" DOUBLE PRECISION,
    "chiefComplaint" TEXT NOT NULL,
    "triageLevel" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "triages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queues" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'WAITING',
    "position" INTEGER,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_requests" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "requestedById" TEXT,
    "requestedByName" TEXT,
    "clinicalIndication" TEXT,
    "labNotes" TEXT,
    "status" "LabRequestStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_request_tests" (
    "id" TEXT NOT NULL,
    "labRequestId" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "category" "LabTestCategory" NOT NULL,
    "result" TEXT,
    "unit" TEXT,
    "referenceRange" TEXT,
    "flag" TEXT,
    "remarks" TEXT,
    "performedAt" TIMESTAMP(3),
    "performedBy" TEXT,

    CONSTRAINT "lab_request_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_requests" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "requestedById" TEXT,
    "reportedById" TEXT,
    "requestedByName" TEXT,
    "clinicalData" TEXT,
    "xrayType" TEXT,
    "ultrasound" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scanType" TEXT,
    "status" "RadiologyRequestStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "findings" TEXT,
    "impression" TEXT,
    "radiologistNotes" TEXT,
    "reportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radiology_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "billingMethod" "BillingMethod" NOT NULL DEFAULT 'FIXED',
    "basePrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "oldPrice" DOUBLE PRECISION NOT NULL,
    "newPrice" DOUBLE PRECISION NOT NULL,
    "changeReason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdById" TEXT,
    "subTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "total" DOUBLE PRECISION NOT NULL,
    "isOverride" BOOLEAN NOT NULL DEFAULT false,
    "overrideReason" TEXT,
    "serviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "prescribedById" TEXT,
    "medicineName" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "duration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_histories" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "historyEntries" JSONB NOT NULL DEFAULT '[]',
    "latestDiagnosis" TEXT,
    "latestNotes" TEXT,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_sequences_loc_year_month_key" ON "patient_sequences"("loc", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "patients_mrn_key" ON "patients"("mrn");

-- CreateIndex
CREATE UNIQUE INDEX "patients_phoneNumber_key" ON "patients"("phoneNumber");

-- CreateIndex
CREATE INDEX "patients_mrn_idx" ON "patients"("mrn");

-- CreateIndex
CREATE INDEX "patients_phoneNumber_idx" ON "patients"("phoneNumber");

-- CreateIndex
CREATE INDEX "patients_fullName_idx" ON "patients"("fullName");

-- CreateIndex
CREATE INDEX "patients_lastVisitDate_idx" ON "patients"("lastVisitDate");

-- CreateIndex
CREATE INDEX "consultations_patientId_idx" ON "consultations"("patientId");

-- CreateIndex
CREATE INDEX "consultations_createdById_idx" ON "consultations"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "triages_patientId_key" ON "triages"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "queues_patientId_key" ON "queues"("patientId");

-- CreateIndex
CREATE INDEX "lab_requests_patientId_idx" ON "lab_requests"("patientId");

-- CreateIndex
CREATE INDEX "lab_requests_status_idx" ON "lab_requests"("status");

-- CreateIndex
CREATE INDEX "lab_requests_requestedById_idx" ON "lab_requests"("requestedById");

-- CreateIndex
CREATE INDEX "lab_request_tests_labRequestId_idx" ON "lab_request_tests"("labRequestId");

-- CreateIndex
CREATE INDEX "radiology_requests_patientId_idx" ON "radiology_requests"("patientId");

-- CreateIndex
CREATE INDEX "radiology_requests_status_idx" ON "radiology_requests"("status");

-- CreateIndex
CREATE INDEX "radiology_requests_requestedById_idx" ON "radiology_requests"("requestedById");

-- CreateIndex
CREATE INDEX "radiology_requests_reportedById_idx" ON "radiology_requests"("reportedById");

-- CreateIndex
CREATE UNIQUE INDEX "service_definitions_name_key" ON "service_definitions"("name");

-- CreateIndex
CREATE INDEX "invoices_patientId_idx" ON "invoices"("patientId");

-- CreateIndex
CREATE INDEX "invoices_createdById_idx" ON "invoices"("createdById");

-- CreateIndex
CREATE INDEX "appointments_patientId_idx" ON "appointments"("patientId");

-- CreateIndex
CREATE INDEX "appointments_appointmentDate_idx" ON "appointments"("appointmentDate");

-- CreateIndex
CREATE INDEX "patient_histories_patientId_idx" ON "patient_histories"("patientId");

-- CreateIndex
CREATE INDEX "patient_histories_archivedAt_idx" ON "patient_histories"("archivedAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triages" ADD CONSTRAINT "triages_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_requests" ADD CONSTRAINT "lab_requests_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_requests" ADD CONSTRAINT "lab_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_request_tests" ADD CONSTRAINT "lab_request_tests_labRequestId_fkey" FOREIGN KEY ("labRequestId") REFERENCES "lab_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_requests" ADD CONSTRAINT "radiology_requests_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_requests" ADD CONSTRAINT "radiology_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_requests" ADD CONSTRAINT "radiology_requests_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_prescribedById_fkey" FOREIGN KEY ("prescribedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_histories" ADD CONSTRAINT "patient_histories_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
