import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const zoneName = searchParams.get("zone");

    const shelves = await prisma.shelf.findMany({
      where: zoneName ? {
        zone: { name: zoneName }
      } : {},
      include: {
        _count: {
          select: { materials: true }
        }
      },
      orderBy: { code: 'asc' } // Sorted by code for better UX
    });

    const mappedData = shelves.map(s => ({
      id: s.id,
      code: s.code,
      level: s.level,
      capacity: s.capacity,
      items_count: s._count.materials,
      status: s.status,
    }));

    return NextResponse.json(mappedData);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch shelves" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, zoneName, level, capacity } = body;

    if (!code || !zoneName) {
      return NextResponse.json({ error: "Code and Zone are required" }, { status: 400 });
    }

    // 1. Find the Zone by name (since your UI works with names)
    const zoneRecord = await prisma.zone.findUnique({
      where: { name: zoneName },
    });

    if (!zoneRecord) {
      return NextResponse.json({ error: "Selected zone does not exist" }, { status: 404 });
    }

    // 2. Create the Shelf record
    const newShelf = await prisma.shelf.create({
      data: {
        code: code,
        level: level || "L1",
        capacity: parseInt(capacity) || 100, // Ensure integer
        status: "Active",
        zoneId: zoneRecord.id, // Use the ID from the found zone
      },
    });

    return NextResponse.json(newShelf);
  } catch (error: any) {
    console.error("Prisma Error:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Shelf code must be unique across the warehouse" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}