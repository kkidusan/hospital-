import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { fullName, age, ageUnit, sex, phone, address, region } = body;

    // 1. Check for Phone Number Uniqueness (Exclude current patient)
    if (phone) {
      const existingPhone = await prisma.patient.findFirst({
        where: {
          phoneNumber: phone,
          NOT: { id: id }
        }
      });

      if (existingPhone) {
        return NextResponse.json(
          { success: false, error: "This phone number is already registered to another patient." },
          { status: 400 }
        );
      }
    }

    // 2. Fetch the patient to see if they need an MRN conversion
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    let finalMRN = patient.mrn;

    // 3. Conversion Logic (TEP_ to WD-YYYYMM-XXXX) with Collision Handling
    if (patient.mrn.startsWith('TEP_')) {
      const now = new Date();
      const fullYear = now.getFullYear();
      const month = now.getMonth() + 1;
      const shortYear = fullYear % 100;
      const LOC = 'WD';

      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        // Increment sequence
        const sequenceRecord = await prisma.patientSequence.upsert({
          where: {
            loc_year_month: { loc: LOC, year: shortYear, month: month }
          },
          update: { lastSeq: { increment: 1 } },
          create: { loc: LOC, year: shortYear, month: month, lastSeq: 1 },
        });

        const formattedYearMonth = `${fullYear}${String(month).padStart(2, '0')}`;
        const sequenceNumber = String(sequenceRecord.lastSeq).padStart(4, '0');
        const candidateMRN = `${LOC}-${formattedYearMonth}-${sequenceNumber}`;

        // Check if this candidate exists in the Patient table
        const collision = await prisma.patient.findUnique({
          where: { mrn: candidateMRN }
        });

        if (!collision) {
          finalMRN = candidateMRN;
          isUnique = true;
        } else {
          attempts++; // If collision exists, loop again to get the next number
        }
      }
    }

    // 4. Final Database Update
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        mrn: finalMRN,
        fullName: fullName.trim(),
        age: parseInt(age.toString()),
        ageUnit: ageUnit || 'years',
        phoneNumber: phone || null,
        sex: sex,
        address: address || null,
        region: region || 'Addis Ababa',
        lastSummary: null // Clear emergency status
      }
    });

    return NextResponse.json({ 
      success: true, 
      patient: updatedPatient 
    });

  } catch (error: any) {
    console.error("Update Error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: "The generated MRN or Phone number already exists." },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}