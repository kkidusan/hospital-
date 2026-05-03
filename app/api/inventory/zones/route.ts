import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Ensure this points to your Prisma client instance

export async function GET() {
  try {
    const zones = await prisma.zone.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(zones);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch zones" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Logic to save to database
    const newZone = await prisma.zone.create({
      data: {
        name: body.name,
        description: body.description,
        shelves: parseInt(body.shelves) || 0,
        status: body.status || "Active",
      },
    });

    return NextResponse.json(newZone, { status: 201 });
  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create zone" }, 
      { status: 500 }
    );
  }
}