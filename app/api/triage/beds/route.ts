import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const wards = await prisma.ward.findMany({
      where: {
        OR: [
          { type: 'MATERNITY' },
          { name: { contains: 'MATERNITY', mode: 'insensitive' } }
        ]
      },
      include: { 
        rooms: { 
          include: { beds: true },
          orderBy: { roomNumber: 'asc' }
        } 
      }
    });

    // Return the wards directly to maintain grouping
    return NextResponse.json(wards);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch beds" }, { status: 500 });
  }
}