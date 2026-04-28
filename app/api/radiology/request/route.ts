// app/api/radiology/route.ts
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const patientId = formData.get('patientId') as string;
    const clinicalData = formData.get('clinicalData') as string;
    const xrayType = formData.get('xrayType') as string | null;
    const ultrasoundJson = formData.get('ultrasound') as string | null;

    let ultrasound: string[] = [];
    if (ultrasoundJson) {
      try {
        ultrasound = JSON.parse(ultrasoundJson);
      } catch (e) {
        ultrasound = [];
      }
    }

    if (!patientId || !clinicalData) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId and clinicalData' },
        { status: 400 }
      );
    }

    const radiologyRequest = await prisma.radiologyRequest.create({
      data: {
        patientId,
        clinicalData: clinicalData.trim(),
        xrayType: xrayType?.trim() || null,
        ultrasound,
        scanType: ultrasound.length > 0 && xrayType
          ? 'Ultrasound + X-Ray'
          : ultrasound.length > 0
            ? 'Ultrasound'
            : xrayType
              ? 'X-Ray'
              : 'Radiology',
        status: 'PENDING_PAYMENT',   // Better to use enum value
      },
      include: {
        patient: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Radiology request created successfully',
      data: radiologyRequest,
    });

  } catch (error: any) {
    console.error('Radiology request creation error:', error);
    return NextResponse.json({
      error: 'Failed to create radiology request',
      details: error.message || 'Unknown error occurred',
    }, { status: 500 });
  }
}