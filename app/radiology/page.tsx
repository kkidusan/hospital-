// app/radiology/page.tsx

// ቢልድ ላይ ዳታቤዝ እንዳይፈልግ የሚከለክለው ወሳኙ መስመር
export const dynamic = 'force-dynamic'; 

import { prisma } from '@/lib/db';
import RadiologyInterface from './RadiologyRequestClient';
import { revalidatePath } from 'next/cache';

export default async function RadiologyPage() {
  // ቢልድ እንዳይቋረጥ በ try-catch ማቀፍ ይመከራል
  try {
    const requests = await prisma.radiologyRequest.findMany({
      where: { status: 'PAID' },
      include: {
        patient: {
          select: {
            fullName: true,
            mrn: true,
            age: true,
            gender: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    async function submitRadiologyFindings(formData: FormData) {
      'use server';
      
      const requestId = formData.get('requestId') as string;
      const findings = (formData.get('findings') as string)?.trim() || '';
      const impression = (formData.get('impression') as string)?.trim() || null;
      const radiologistNotes = (formData.get('radiologistNotes') as string)?.trim() || null;

      if (!findings) {
        throw new Error("Findings are required for radiology report.");
      }

      await prisma.radiologyRequest.update({
        where: { id: requestId },
        data: {
          findings,
          impression,
          radiologistNotes,
          reportedBy: "Radiologist",
          reportedAt: new Date(),
          status: 'COMPLETED',
        },
      });

      revalidatePath('/radiology');
      revalidatePath('/specialist'); 
    }

    return (
      <RadiologyInterface 
        requests={requests} 
        submitAction={submitRadiologyFindings} 
      />
    );
  } catch (error) {
    console.error("Radiology database error:", error);
    // ዳታቤዙ ባይገኝ እንኳ ባዶ ሊስት ልከን ቢልዱ እንዲያልፍ እናደርጋለን
    return (
      <RadiologyInterface 
        requests={[]} 
        submitAction={async () => { 'use server'; }} 
      />
    );
  }
}