import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import SamplesClientInterface from './SamplesClientInterface';

export default async function LabSamplesPage() {
  // Fetch all lab requests that are not yet completed
  const pendingSamples = await prisma.labRequest.findMany({
    where: {
      status: { in: ['PENDING', 'COLLECTING'] }
    },
    include: {
      patient: true,
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // Server Action to update sample status or results
  async function updateSample(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;
    const result = formData.get('result') as string;
    const unit = formData.get('unit') as string;
    const flag = formData.get('flag') as string;
    const remarks = formData.get('remarks') as string;

    await prisma.labRequest.update({
      where: { id },
      data: {
        status: status || 'COMPLETED',
        result: result || null,
        unit: unit || null,
        flag: flag || 'NORMAL',
        remarks: remarks || null,
        updatedAt: new Date(),
      }
    });

    revalidatePath('/laboratory/samples');
  }

  return (
    <div style={container}>
      <SamplesClientInterface 
        samples={JSON.parse(JSON.stringify(pendingSamples))} 
        onUpdate={updateSample} 
      />
    </div>
  );
}

const container = { padding: '30px', background: '#f8fafc', minHeight: '100vh' };