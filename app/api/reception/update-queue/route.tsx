import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { patientId } = await req.json()

    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 })
    }

    // Find existing queue entry
    const queue = await prisma.queue.findUnique({
      where: { patientId },
    })

    if (!queue) {
      return NextResponse.json({ error: 'No queue entry found for this patient' }, { status: 404 })
    }

    // Update to IN_TRIAGE
    const updated = await prisma.queue.update({
      where: { id: queue.id },
      data: {
        status: 'IN_TRIAGE',
        updatedAt: new Date(),
        // notes: 'Triage started by receptionist', // optional
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Patient moved to In Triage',
      queue: updated,
    }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update queue status' }, { status: 500 })
  }
}