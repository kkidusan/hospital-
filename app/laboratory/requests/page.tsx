// app/laboratory/requests/page.tsx

// 1. ይህ በጣም ወሳኙ መስመር ነው (ቢልድ ስህተቱን የሚፈታው ይህ ነው)
export const dynamic = 'force-dynamic'; 

import React from 'react';
import { prisma } from '@/lib/db';
import LabRequestsTable from './LabRequestClient';

export default async function LaboratoryRequestsPage() {
  try {
    const requests = await prisma.labRequest.findMany({
      where: { 
        // 2. በ schema.prisma ላይ Enum ከሆነ እንዲህ መጠቀም ይሻላል
        status: 'PAID' 
      },
      include: { 
        patient: {
          select: {
            fullName: true,
            mrn: true,
            age: true,
            gender: true,
          }
        },
        tests: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return <LabRequestsTable initialRequests={requests} />;
  } catch (error) {
    console.error("Failed to fetch lab requests:", error);
    // ዳታቤዙ ገና ካልተነሳ ባዶ ሊስት እንዲያሳይ ማድረግ ይቻላል
    return <LabRequestsTable initialRequests={ [] } />;
  }
}