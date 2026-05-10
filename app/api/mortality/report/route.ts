import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const requiredFields = ['patientId', 'reportedById', 'primaryCause', 'dateOfDeath', 'timeOfDeath'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Field '${field}' is required.` }, { status: 400 });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const report = await tx.mortalityReport.create({
        data: {
          patientId: body.patientId,
          admissionId: body.admissionId || null,
          reportedById: body.reportedById,
          primaryCause: body.primaryCause,
          dateOfDeath: new Date(body.dateOfDeath), 
          timeOfDeath: body.timeOfDeath,
          clinicalSummary: body.clinicalSummary || "",
        },
      });

      await tx.patient.update({
        where: { id: body.patientId },
        data: {
          lastSummary: `Mortality Report Filed: ${body.primaryCause}`,
          updatedAt: new Date(),
        },
      });

      return report;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Report already registered." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}