import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    // 1. Fetch current record
    const withdrawal = await prisma.materialWithdrawal.findUnique({
      where: { id },
      include: { material: true }
    });

    if (!withdrawal) return NextResponse.json({ error: "Record not found" }, { status: 404 });

    // 2. Handle Final Handover & Stock Deduction
    if (status === "WITHDRAWN") {
      if (withdrawal.material.totalInBaseUnits < withdrawal.quantity) {
        return NextResponse.json({ error: "Insufficient stock in vault" }, { status: 400 });
      }

      const result = await prisma.$transaction([
        prisma.material.update({
          where: { id: withdrawal.materialId },
          data: { totalInBaseUnits: { decrement: withdrawal.quantity } }
        }),
        prisma.materialWithdrawal.update({
          where: { id },
          data: { status: "WITHDRAWN" }
        })
      ]);
      return NextResponse.json(result[1]);
    }

    // 3. Handle intermediate status updates (Approve/Request)
    const updated = await prisma.materialWithdrawal.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}