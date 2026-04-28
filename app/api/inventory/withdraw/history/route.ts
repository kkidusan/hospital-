import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const history = await prisma.materialWithdrawal.findMany({
      orderBy: {
        createdAt: "desc", // Latest withdrawals first
      },
      include: {
        material: {
          select: {
            name: true,
            sku: true
          }
        }
      },
      take: 50, // Limit to last 50 entries
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("History Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}