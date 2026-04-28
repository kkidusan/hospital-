// app/specialist/records/page.tsx
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import RecordsClient from './RecordsClient';

export default async function SpecialistRecordsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Fetch Lab Requests (today)
  const labRequests = await prisma.labRequest.findMany({
    where: {
      createdAt: { gte: todayStart, lte: todayEnd },
    },
    include: {
      patient: {
        select: { fullName: true, mrn: true, age: true, gender: true },
      },
      tests: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch Radiology Requests (today)
  const radiologyRequests = await prisma.radiologyRequest.findMany({
    where: {
      createdAt: { gte: todayStart, lte: todayEnd },
    },
    include: {
      patient: {
        select: { fullName: true, mrn: true, age: true, gender: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch invoices for payment status
  const labRequestIds = labRequests.map((r) => r.id);
  const radiologyRequestIds = radiologyRequests.map((r) => r.id);

  const [labInvoices, radInvoices] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        relatedRequestId: { in: labRequestIds.length ? labRequestIds : [''] },
        relatedRequestType: 'LAB_REQUEST',
      },
      select: { relatedRequestId: true, status: true },
    }),
    prisma.invoice.findMany({
      where: {
        relatedRequestId: { in: radiologyRequestIds.length ? radiologyRequestIds : [''] },
        relatedRequestType: 'RADIOLOGY_REQUEST',
      },
      select: { relatedRequestId: true, status: true },
    }),
  ]);

  const labInvoiceMap = new Map(labInvoices.map((i) => [i.relatedRequestId!, i.status]));
  const radInvoiceMap = new Map(radInvoices.map((i) => [i.relatedRequestId!, i.status]));

  const data = {
    labRequests,
    radiologyRequests,
    labInvoiceMap: Object.fromEntries(labInvoiceMap), // Convert Map to plain object for client
    radInvoiceMap: Object.fromEntries(radInvoiceMap),
    userId: session.user.id,   // Pass current user ID
  };

  return <RecordsClient data={data} />;
}