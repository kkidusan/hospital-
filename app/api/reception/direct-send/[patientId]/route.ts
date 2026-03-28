import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params

    // 1. Check if the patient exists and has a queue record
    const existingQueue = await prisma.queue.findUnique({
      where: { patientId }
    })

    if (!existingQueue) {
      // If they aren't in the queue yet (e.g., just registered), create the entry
      await prisma.queue.create({
        data: {
          patientId,
          status: 'TRIAGED', // Mark as TRIAGED so they show up for the Doctor
          position: 1,       // You can logic this to be the end of the list
        }
      })
    } else {
      // 2. If they are already in the queue (status WAITING), update them
      await prisma.queue.update({
        where: { patientId },
        data: {
          status: 'TRIAGED', // Skipping 'IN_TRIAGE' and going straight to 'TRIAGED'
          updatedAt: new Date(),
        }
      })
    }

    return NextResponse.json({ success: true, message: "Patient sent to Doctor" })

  } catch (error: any) {
    console.error('DIRECT_SEND_ERROR:', error)
    return NextResponse.json(
      { error: 'Failed to bypass triage', details: error.message }, 
      { status: 500 }
    )
  }
}