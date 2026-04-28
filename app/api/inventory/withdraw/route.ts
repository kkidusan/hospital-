import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth"; // This imports the 'auth' you exported from your config

export async function POST(req: Request) {
  try {
    // 1. Get current session using your v5 auth helper
    const session = await auth();

    // 2. Security Guard
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required. Please log in again." }, 
        { status: 401 }
      );
    }

    const body = await req.json();
    const { materialId, quantity, department } = body;

    // 3. Database Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find material and check stock
      const material = await tx.material.findUnique({
        where: { id: materialId },
      });

      if (!material) throw new Error("Asset not found in database.");
      
      if (material.totalInBaseUnits < quantity) {
        throw new Error(`Insufficient stock. Available: ${material.totalInBaseUnits}`);
      }

      // 4. Create withdrawal AND update requestedBy from session
      const withdrawal = await tx.materialWithdrawal.create({
        data: {
          materialId,
          quantity,
          department: department || "Laboratory",
          // WE STORE THE NAME FROM THE AUTH SESSION HERE
          requestedBy: session.user.name || "Unknown Staff",
          status: "PENDING",
        },
      });

      // Optional: Audit log integration
      await tx.auditLog.create({
        data: {
          userId: session.user.id!,
          action: "MATERIAL_WITHDRAWAL_REQUEST",
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          details: { materialId, quantity },
        },
      });

      return withdrawal;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("WITHDRAWAL_API_ERROR:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to process disbursement" }, 
      { status: 400 }
    );
  }
}