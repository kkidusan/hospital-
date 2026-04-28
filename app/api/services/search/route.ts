import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('cat'); // LABORATORY or RADIOLOGY

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const services = await prisma.serviceDefinition.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
        category: category as any, // Filters by the tab you are currently on
      },
      take: 8, // Limit results for performance
      select: {
        id: true,
        name: true,
        basePrice: true,
      }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("API Search Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}