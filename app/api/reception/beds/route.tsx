import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // 1. Fetch beds including related patient details
    const beds = await prisma.bed.findMany({
      include: {
        currentPatient: {
          select: {
            fullName: true,
            mrn: true,
            registeredAt: true
          }
        }
      },
      orderBy: { bedNumber: 'asc' }
    });

    // 2. Map data to check for Emergency vs Normal
    const bedList = beds.map(bed => {
      const isEmergency = bed.currentPatient?.mrn?.startsWith('TEP_');
      
      return {
        id: bed.id,
        bedNo: bed.bedNumber,
        ward: bed.wardName,
        status: bed.isOccupied ? "OCCUPIED" : "AVAILABLE",
        type: bed.isOccupied ? (isEmergency ? "EMERGENCY" : "NORMAL") : null,
        patientName: bed.currentPatient?.fullName || null,
        mrn: bed.currentPatient?.mrn || null,
        since: bed.currentPatient ? bed.currentPatient.registeredAt.toLocaleTimeString() : null
      };
    });

    return NextResponse.json({ success: true, data: bedList });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch bed status" }, { status: 500 });
  }
}