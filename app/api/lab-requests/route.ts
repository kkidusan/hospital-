// app/api/lab-results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      requestId,
      testId,
      resultValue,
      unit,
      remarks,
    } = body;

    if (!requestId || !testId || !resultValue) {
      return NextResponse.json(
        { error: 'Missing required fields: requestId, testId, resultValue' },
        { status: 400 }
      );
    }

    // Update the specific test result
    await prisma.labRequestTest.update({
      where: { id: testId },
      data: {
        result: resultValue,
        unit: unit || null,
        remarks: remarks || null,
        performedAt: new Date(),
        performedBy: 'Lab Technician', // You can later get from session.user.name
      },
    });

    // Check if all tests in this request are now completed
    const remainingTests = await prisma.labRequestTest.count({
      where: {
        labRequestId: requestId,
        result: null,
      },
    });

    // If no tests left without result → mark request as COMPLETED
    if (remainingTests === 0) {
      await prisma.labRequest.update({
        where: { id: requestId },
        data: { status: 'COMPLETED' },
      });
    }

    // Revalidate the lab requests page so it refreshes automatically
    revalidatePath('/laboratory/requests');

    return NextResponse.json({
      success: true,
      message: 'Result saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving lab result:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save result' },
      { status: 500 }
    );
  }
}