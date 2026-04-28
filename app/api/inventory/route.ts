import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(Array.isArray(materials) ? materials : []);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const material = await prisma.material.create({
      data: {
        name: body.name,
        sku: body.sku || `QR-${Math.random().toString(36).slice(-6).toUpperCase()}`,
        category: body.category,
        unitType: body.selectedUnit,
        conversionRate: body.conversionRate || 1,
        totalInBaseUnits: body.totalInBaseUnits,
        baseUnit: body.baseUnit || "Piece",
        zone: body.zone || "General Store",
        expiryDate: new Date(body.expiry),
        status: body.totalInBaseUnits < 100 ? "Critical" : "Healthy",
      },
    });
    return NextResponse.json(material);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}