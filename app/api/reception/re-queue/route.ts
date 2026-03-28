// app/api/reception/re-queue/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { patientId } = body

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 })
    }

    // 1. Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // 2. Check for active queue entries to prevent duplicates
    const activeQueue = await prisma.queue.findFirst({
      where: {
        patientId,
        status: { in: ['WAITING', 'IN_TRIAGE', 'EMERGENCY'] }
      }
    })

    if (activeQueue) {
      return NextResponse.json({ error: 'Patient is already in the queue' }, { status: 400 })
    }

    // 3. Get the next position (Total count of non-completed)
    const nextPosition = await prisma.queue.count({
      where: { status: { not: 'COMPLETED' } }
    })

    // 4. Create the new Queue entry
    const newQueueEntry = await prisma.queue.create({
      data: {
        patientId: patientId,
        status: 'WAITING',
        position: nextPosition + 1
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Patient added to queue',
      queue: newQueueEntry 
    }, { status: 201 })

  } catch (err: any) {
    console.error('Re-queue Error:', err)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}