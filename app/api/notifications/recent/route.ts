import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.labResultNotification.findMany({
    where: {
      labRequest: {
        requestedById: session.user.id,
      },
      isRead: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      patient: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  const formatted = notifications.map((n) => ({
    id: n.id,
    title: n.title || 'Lab Result Ready',
    message: n.message || 'New laboratory results are available for review.',
    createdAt: n.createdAt.toISOString(),
    isRead: n.isRead,
    patientName: n.patient?.fullName || 'Unknown Patient',
    patientId: n.patient?.id || '',
  }));

  return NextResponse.json({ notifications: formatted });
}