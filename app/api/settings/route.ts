import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Path to your prisma client instance

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    
    // Transform array into a typed Key-Value object
    const config = settings.reduce((acc, s) => ({ 
      ...acc, 
      [s.key]: s.value 
    }), {} as Record<string, string>);
    
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value, category }: { key: string; value: string; category?: string } = body;

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const setting = await prisma.systemSetting.upsert({
      where: { key: key },
      update: { value: value },
      create: { 
        key: key, 
        value: value, 
        category: category || "general" 
      },
    });

    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}