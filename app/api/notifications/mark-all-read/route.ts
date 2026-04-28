import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const paymentStatus = searchParams.get('paymentStatus');

    // Build the dynamic filter
    const whereCondition: any = { 
      userId: session.user.id, 
      isRead: false 
    };

    if (type) whereCondition.type = type;
    if (paymentStatus) whereCondition.paymentStatus = paymentStatus;

    const result = await prisma.notification.updateMany({
      where: whereCondition,
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error("[MARK_ALL_READ_POST]", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}