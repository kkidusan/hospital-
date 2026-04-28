import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Ensure this path matches your Prisma client location

export async function GET() {
  try {
    // Fetch admissions with necessary relations
    const admissions = await prisma.admission.findMany({
      include: {
        patient: true,
        bed: {
          include: {
            room: {
              include: {
                ward: true
              }
            }
          }
        }
      },
      orderBy: {
        admissionDate: 'desc'
      }
    });

    return NextResponse.json(admissions);
  } catch (error) {
    console.error("Billing Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}