// app/api/lab-requests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const labRequest = await prisma.labRequest.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            fullName: true,
            mrn: true,
            age: true,
            gender: true,
          },
        },
        tests: {
          select: {
            id: true,
            testName: true,
            category: true,
            result: true,
          },
        },
      },
    });

    if (!labRequest) {
      return NextResponse.json({ error: 'Lab request not found' }, { status: 404 });
    }

    return NextResponse.json(labRequest);
  } catch (error) {
    console.error('Error fetching lab request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab request' },
      { status: 500 }
    );
  }
}