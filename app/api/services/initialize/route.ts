// app/api/services/initialize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Adjust this path to match your Prisma setup (same as in your consultation page)

export async function POST(request: NextRequest) {
  try {
    const { services } = await request.json();

    if (!services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { error: 'Services array is required and cannot be empty' },
        { status: 400 }
      );
    }

    const createdServices: any[] = [];
    const skippedServices: string[] = [];

    // Use transaction for safety
    await prisma.$transaction(async (tx) => {
      for (const service of services) {
        // Check if service with same name already exists (case-insensitive)
        const existing = await tx.serviceDefinition.findFirst({
          where: {
            name: {
              equals: service.name,
              mode: 'insensitive',
            },
          },
        });

        if (existing) {
          skippedServices.push(service.name);
          continue;
        }

        const newService = await tx.serviceDefinition.create({
          data: {
            name: service.name.trim(),
            category: service.category,
            billingMethod: service.billingMethod,
            basePrice: service.basePrice,
            // You can add more fields if your model has them (e.g. description, isActive)
          },
        });

        createdServices.push(newService);
      }
    });

    const message = `Initialization completed. ${createdServices.length} services created, ${skippedServices.length} already existed.`;

    return NextResponse.json({
      success: true,
      message,
      createdCount: createdServices.length,
      skippedCount: skippedServices.length,
      createdServices,
      skipped: skippedServices,
    });

  } catch (error: any) {
    console.error('Service initialization error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to initialize default services' 
      },
      { status: 500 }
    );
  }
}