// app/api/lab-dashboard/route.ts
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [newCount, inProgressCount, completedCount, allRequests] = await Promise.all([
      prisma.labRequest.count({ where: { status: 'PENDING_PAYMENT' } }),
      prisma.labRequest.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.labRequest.count({
        where: { status: 'COMPLETED', updatedAt: { gte: todayStart } }
      }),
      prisma.labRequest.findMany({
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: {
            select: { id: true, fullName: true, mrn: true, age: true, gender: true }
          },
          tests: { select: { testName: true } }
        }
      })
    ]);

    const urgentCount = allRequests.filter((req: any) =>
      req.tests.some((t: any) =>
        t.testName.toUpperCase().includes('STAT') ||
        t.testName.toUpperCase().includes('URGENT')
      )
    ).length;

    return NextResponse.json({
      newCount,
      inProgressCount,
      completedCount,
      urgentCount,
      allRequests,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}