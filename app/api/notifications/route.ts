// app/api/notifications/route.ts
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const paymentStatus = searchParams.get('paymentStatus');

  const whereCondition: any = {
    userId: session.user.id,
  };

  if (type === 'LAB_REQUEST') {
    whereCondition.type = 'LAB_REQUEST';
  }

  if (paymentStatus === 'PAID') {
    whereCondition.paymentStatus = 'PAID';
  }

  const notifications = await prisma.notification.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  return NextResponse.json(notifications);
}