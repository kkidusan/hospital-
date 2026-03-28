import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import LabOverlayInterface from './LabRequestClient';

export default async function LaboratoryPage() {
  // Fetch only requests that have been marked as PAID by the billing department
  const requests = await prisma.labRequest.findMany({
    where: { 
      status: 'PAID' 
    },
    include: { patient: true },
    orderBy: { createdAt: 'desc' }
  });

  // Action to save the results and mark as COMPLETED
  async function authorizeReport(formData: FormData) {
    'use server';
    
    const id = formData.get('requestId') as string;
    
    const clean = (val: FormDataEntryValue | null) => 
      (val === "" || val === null) ? null : val.toString();

    try {
      await prisma.labRequest.update({
        where: { id: id },
        data: {
          result: clean(formData.get('resultValue')), 
          unit: clean(formData.get('unit')),
          refRange: clean(formData.get('refRange')),
          flag: clean(formData.get('flag')),
          remarks: clean(formData.get('remarks')),
          
          status: 'COMPLETED',
          updatedAt: new Date(),
        }
      });

      // Refresh the laboratory data
      revalidatePath('/laboratory');
    } catch (error) {
      console.error("Database Update Failed:", error);
    }
  }

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Banner text "Ready for Processing..." has been removed 
          The interface below will only show the table of paid requests.
      */}
      <LabOverlayInterface 
        requests={JSON.parse(JSON.stringify(requests))} 
        submitAction={authorizeReport} 
      />
    </div>
  );
}