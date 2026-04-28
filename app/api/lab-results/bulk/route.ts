// app/api/lab-results/bulk/route.ts
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { 
      requestId, 
      results,
      reportedById,     
      reportedByName    
    } = await request.json();

    // Validation
    if (!requestId || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid data: requestId and results array are required' 
      }, { status: 400 });
    }

    if (!reportedById) {
      return NextResponse.json({ 
        error: 'Reported by ID is required' 
      }, { status: 400 });
    }

    const userId = reportedById;
    const userName = reportedByName?.trim() || 'Lab Technician';
    const reportDate = new Date();

    const updatedRequest = await prisma.$transaction(async (tx) => {
      // 1. Update each LabRequestTest
      for (const item of results) {
        if (!item.testId) continue;

        await tx.labRequestTest.update({
          where: { id: item.testId },
          data: {
            result: item.resultValue?.trim() || null,
            unit: item.unit?.trim() || null,
            remarks: item.remarks?.trim() || null,
            performedAt: reportDate,
            performedBy: userName,
            performedById: userId,
            reportedAt: reportDate,
          },
        });
      }

      // 2. Update the main LabRequest
      const labRequest = await tx.labRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED' as const,
          completedAt: reportDate,
          completedById: userId,
          completedByName: userName,
        },
        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              mrn: true,
            },
          },
          tests: {
            select: {
              testName: true,
            },
          },
        },
      });

      // 3. Create LabResultNotification (This was the missing part)
      await tx.labResultNotification.create({
        data: {
          labRequestId: requestId,
          patientId: labRequest.patient.id,
          patientName: labRequest.patient.fullName,
          mrn: labRequest.patient.mrn,
          completedById: userId,
          completedByName: userName,
          title: 'Lab Results Completed',
          message: `Laboratory results for ${labRequest.patient.fullName} (MRN: ${labRequest.patient.mrn}) have been finalized and are now ready for review.`,
          type: 'LAB_REQUEST',
        },
      });

      return labRequest;
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Lab results saved successfully and notification created.',
      requestId: updatedRequest.id,
      patientName: updatedRequest.patient.fullName,
    });

  } catch (error: any) {
    console.error('Bulk lab result error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({ 
        error: 'Lab request or test record not found' 
      }, { status: 404 });
    }

    if (error.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Foreign key constraint failed. Check user or patient IDs.' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error while saving results.' 
    }, { status: 500 });
  }
}