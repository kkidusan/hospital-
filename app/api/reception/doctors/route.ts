// app/api/reception/doctors/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Adjust this path to your Prisma client

export async function GET() {
  try {
    // 1. Fetch users where role is SPECIALIST
    const specialists = await prisma.user.findMany({
      where: {
        role: 'SPECIALIST',
      },
      select: {
        id: true,
        name: true,
        specialty: true,
      },
    });

    // 2. Return the data in the format the frontend expects
    return NextResponse.json({ doctors: specialists });
  } catch (error) {
    console.error('Error fetching specialists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors', doctors: [] },
      { status: 500 }
    );
  }
}