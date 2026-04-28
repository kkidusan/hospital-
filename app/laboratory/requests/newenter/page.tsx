// app/laboratory/requests/newenter/page.tsx
import { prisma } from '@/lib/db';
import NewEnterClient from './NewEnterClient';

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function NewEnterPage({ searchParams }: Props) {
  const { id: requestId } = await searchParams;

  if (!requestId) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800">Error</h2>
          <p className="mt-2 text-red-600">Request ID is missing</p>
        </div>
      </div>
    );
  }

  let initialRequest = null;

  try {
    initialRequest = await prisma.labRequest.findUnique({
      where: { id: requestId },
      include: {
        patient: {
          select: {
            fullName: true,
            mrn: true,
            age: true,
            gender: true,
          },
        },
        tests: {
          select: {
            id: true,
            testName: true,
            category: true,
            result: true,
            unit: true,           // Good to include
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching lab request:', error);
  }

  if (!initialRequest) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-800">Request Not Found</h2>
          <p className="mt-4 text-red-600">The requested lab entry was not found.</p>
        </div>
      </div>
    );
  }

  return <NewEnterClient initialRequest={initialRequest} />;
}