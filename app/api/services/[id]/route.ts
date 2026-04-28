import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await prisma.serviceDefinition.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("GET service error:", error);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    }

    let finalCategory: any = body.category?.toUpperCase();

    if (finalCategory === "OTHER" && body.customCategory) {
      finalCategory = body.customCategory.trim().toUpperCase();
    }

    const validCategories = [
      "LABORATORY", "RADIOLOGY", "CONSULTATION", "INPATIENT", 
      "PROCEDURE", "AMBULANCE", "PHARMACY", "OTHER"
    ];

    if (!validCategories.includes(finalCategory)) {
      finalCategory = "OTHER";
    }

    const updatedService = await prisma.serviceDefinition.update({
      where: { id },
      data: {
        name: body.name?.trim(),
        category: finalCategory,
        billingMethod: body.billingMethod,
        basePrice: parseFloat(body.basePrice),
      },
    });

    return NextResponse.json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error: any) {
    console.error("PUT error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      error: error.message || "Failed to update service" 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.serviceDefinition.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error: any) {
    console.error("DELETE error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}