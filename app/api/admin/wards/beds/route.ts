import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const wards = await prisma.ward.findMany({
      include: { 
        rooms: { 
          include: { beds: true },
          orderBy: { roomNumber: 'asc' }
        } 
      },
      orderBy: { type: 'asc' }
    });
    return NextResponse.json(wards);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch registry" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, wardType, roomId, name, isPrivate } = body;

    // 1. Create or get the Ward. 
    // Note: wardType must match the Prisma Enum exactly.
    const ward = await prisma.ward.upsert({
      where: { name: `${wardType} Ward` },
      update: {},
      create: { 
        name: `${wardType} Ward`, 
        type: wardType // Ensure this is one of the WardType enum values
      },
    });

    if (type === "ROOM") {
      const room = await prisma.room.create({
        data: {
          roomNumber: name,
          isPrivate: isPrivate,
          wardId: ward.id,
          // Auto-create first bed if private
          beds: isPrivate ? { create: { bedNumber: `${name}-P1` } } : undefined
        }
      });
      return NextResponse.json(room);
    }

    if (type === "BED") {
      const bed = await prisma.bed.create({
        data: { bedNumber: name, roomId: roomId }
      });
      return NextResponse.json(bed);
    }
    
    return NextResponse.json({ error: "Invalid registration type" }, { status: 400 });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { roomId, name, isPrivate, wardType } = body;

    const ward = await prisma.ward.upsert({
      where: { name: `${wardType} Ward` },
      update: {},
      create: { name: `${wardType} Ward`, type: wardType },
    });

    const room = await prisma.room.update({
      where: { id: roomId },
      data: {
        roomNumber: name,
        isPrivate: isPrivate,
        wardId: ward.id
      }
    });
    return NextResponse.json(room);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bedId = searchParams.get("bedId");
    if (!bedId) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.bed.delete({ where: { id: bedId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Could not delete asset" }, { status: 500 });
  }
}