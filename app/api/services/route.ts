import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const services = await prisma.serviceDefinition.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("GET services error:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

// POST - Create new service (with custom category support)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.category || body.basePrice === undefined) {
      return NextResponse.json({ 
        error: "Missing required fields: name, category, basePrice" 
      }, { status: 400 });
    }

    let finalCategory: any = body.category.toUpperCase();

    // If user chose "OTHER" and provided a custom category name
    if (finalCategory === "OTHER" && body.customCategory) {
      finalCategory = body.customCategory.trim().toUpperCase();
    }

    // Safety: If it's not a known enum value, force it to OTHER
    const validCategories = [
      "LABORATORY", "RADIOLOGY", "CONSULTATION", "INPATIENT", 
      "PROCEDURE", "AMBULANCE", "PHARMACY", "OTHER"
    ];

    if (!validCategories.includes(finalCategory)) {
      finalCategory = "OTHER";
    }

    const service = await prisma.serviceDefinition.create({
      data: {
        name: body.name.trim(),
        category: finalCategory as any,        // Prisma will accept it if it's in enum
        billingMethod: body.billingMethod || "FIXED",
        basePrice: parseFloat(body.basePrice),
      },
    });

    return NextResponse.json({ 
      message: "Service created successfully", 
      service 
    });
  } catch (error: any) {
    console.error("POST service error:", error);

    if (error.code === "P2002") {
      return NextResponse.json({ error: "A service with this name already exists" }, { status: 409 });
    }

    return NextResponse.json({ 
      error: error.message || "Failed to create service" 
    }, { status: 500 });
  }
}