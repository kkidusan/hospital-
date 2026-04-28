import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Adjust this to your DB client path

export async function GET() {
  try {
    // Fetch all staff members from your database
    const staff = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialty: true,
        // status: true, // Uncomment if you have a status field in DB
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Add a default status if it doesn't exist in your DB schema yet
    const staffWithStatus = staff.map(member => ({
      ...member,
      status: 'ACTIVE', // Defaulting to ACTIVE for display
    }));

    return NextResponse.json(staffWithStatus);
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}