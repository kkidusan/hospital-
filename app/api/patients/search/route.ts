// app/api/patients/search/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json(null);

  try {
    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { mrn: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        admissions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        // Integrated Patient History
        patientHistory: true 
      }
    });

    return NextResponse.json(patient);
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}