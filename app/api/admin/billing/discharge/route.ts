import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AdmissionStatus, PaymentStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { admissionId, totalAmount } = await req.json();

    if (!admissionId) {
      return NextResponse.json({ success: false, error: "Admission ID is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find admission
      const admission = await tx.admission.findUnique({
        where: { id: admissionId },
        select: { bedId: true, patientId: true, admissionDate: true }
      });

      if (!admission) throw new Error("Admission record not found");

      // 2. Update Admission Status
      const updatedAdmission = await tx.admission.update({
        where: { id: admissionId },
        data: {
          status: AdmissionStatus.DISCHARGED,
          dischargeDate: new Date(),
        },
      });

      // 3. Create a Final Invoice
      const invoice = await tx.invoice.create({
        data: {
          patientId: admission.patientId,
          admissionId: admissionId,
          status: PaymentStatus.PAID,
          totalAmount: totalAmount || 0, // Passed from frontend calculation
          paymentMethod: "CASH",
          paidAt: new Date(),
        }
      });

      // 4. Free the bed
      if (admission.bedId) {
        await tx.bed.update({
          where: { id: admission.bedId },
          data: { isOccupied: false }
        });
      }

      return { admission: updatedAdmission, invoice };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("DISCHARGE_ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}