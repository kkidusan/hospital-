import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, age, ageUnit, sex, phone, address, region } = body;

    if (!fullName?.trim() || !age || !sex) {
      return NextResponse.json(
        { error: 'Full name, age and sex are required' },
        { status: 400 }
      );
    }

    const cleanPhone = phone?.trim() || null;

    if (cleanPhone && cleanPhone !== '+251') {
      const existingPatient = await prisma.patient.findUnique({
        where: { phoneNumber: cleanPhone },
      });

      if (existingPatient) {
        return NextResponse.json(
          { error: 'This phone number is already registered.' },
          { status: 400 }
        );
      }
    }

    const LOC = 'WD';
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const prefix = `${LOC}-${year}${String(month).padStart(2, '0')}-`;

    const sequenceRecord = await prisma.patientSequence.upsert({
      where: {
        loc_year_month: {
          loc: LOC,
          year: year,
          month: month,
        },
      },
      update: { lastSeq: { increment: 1 } },
      create: {
        loc: LOC,
        year: year,
        month: month,
        lastSeq: 1,
      },
    });

    const sequence = String(sequenceRecord.lastSeq).padStart(4, '0');
    const mrn = `${prefix}${sequence}`;

    const patient = await prisma.patient.create({
      data: {
        mrn,
        fullName: fullName.trim(),
        age: parseInt(age.toString()),
        ageUnit: ageUnit || 'years',
        sex: sex,
        phoneNumber: cleanPhone,
        address: address?.trim() || null,
        region: region || 'Addis Ababa',
        queue: {
          create: { status: 'WAITING' },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Patient registered successfully',
        patient,
      },
      { status: 201 }
    );

  } catch (err: any) {
    console.error('Patient registration error:', err);

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return NextResponse.json(
          { error: 'Conflict: Phone number or MRN already exists.' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to register patient. Please try again.' },
      { status: 500 }
    );
  }
}