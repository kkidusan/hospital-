import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const admissions = await prisma.admission.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        patient: {
          select: {
            mrn: true,
            fullName: true,
            age: true,
            sex: true,
          },
        },
        admittingDoctor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        admissionDate: 'desc',
      },
    });

    const formattedAdmissions = admissions.map((adm) => {
      const admissionDate = new Date(adm.admissionDate);
      const stayDays = Math.max(
        Math.floor((Date.now() - admissionDate.getTime()) / (1000 * 3600 * 24)),
        1
      );

      return {
        id: adm.id,
        patient: adm.patient,
        admissionDate: adm.admissionDate.toISOString(),
        ward: adm.ward,
        bedNumber: adm.bedNumber,
        status: adm.status,
        source: adm.source,
        admittingDoctor: adm.admittingDoctor,
        stayDays,
      };
    });

    return NextResponse.json(formattedAdmissions);
  } catch (error: any) {
    console.error('Error fetching admissions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch admissions',
        details: error.message 
      },
      { status: 500 }
    );
  }
}