import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      include: { zone: true, shelf: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(materials);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. GENERATE SEQUENTIAL SKU
    const lastMaterial = await prisma.material.findFirst({
      where: { sku: { startsWith: "SKU-" } },
      orderBy: { createdAt: "desc" },
      select: { sku: true }
    });

    let nextSku = "SKU-0001";
    if (lastMaterial && lastMaterial.sku) {
      const lastNumber = parseInt(lastMaterial.sku.replace("SKU-", ""), 10);
      nextSku = `SKU-${(lastNumber + 1).toString().padStart(4, '0')}`;
    }

    // 2. CREATE MATERIAL
    const material = await prisma.material.create({
      data: {
        name: body.name,
        sku: nextSku, 
        category: body.category,
        totalInBaseUnits: parseInt(body.initialQty) || 0,
        minThreshold: parseInt(body.minThreshold) || 10,
        expiryDate: body.expiry ? new Date(body.expiry) : null,
        requiresApproval: body.requiresApproval || false,
        baseUnit: body.unitType || "Piece", 
        qtyPerCarton: parseInt(body.qtyPerCarton) || 0,
        qtyPerBox: parseInt(body.qtyPerBox) || 0,
        maxQuotaPerRequest: parseInt(body.maxQuotaPerRequest) || 0,
        zone: body.zoneId ? { connect: { id: body.zoneId } } : undefined,
        shelf: body.shelfId ? { connect: { id: body.shelfId } } : undefined,
      },
    });
    
    return NextResponse.json(material);
  } catch (error) {
    console.error("Create Error:", error);
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, sidebarMode } = body;

    const updateData: any = {
      name: body.name,
      category: body.category,
      minThreshold: parseInt(body.minThreshold),
      expiryDate: body.expiry ? new Date(body.expiry) : null,
      baseUnit: body.unitType || "Piece",
      qtyPerCarton: parseInt(body.qtyPerCarton) || 0,
      qtyPerBox: parseInt(body.qtyPerBox) || 0,
      zoneId: body.zoneId || null,
      shelfId: body.shelfId || null,
    };

    // Use Prisma increment for stock adjustments
    if (sidebarMode === "ADD_STOCK") {
      updateData.totalInBaseUnits = { increment: parseInt(body.initialQty) };
    } else {
      updateData.totalInBaseUnits = parseInt(body.initialQty);
    }

    const updated = await prisma.material.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.material.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}