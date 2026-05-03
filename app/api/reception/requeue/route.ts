// app/api/reception/requeue/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db' // Ensure this path matches your prisma client location

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { patientId, status } = body

    if (!patientId) {
      return NextResponse.json({ message: 'Patient ID is required' }, { status: 400 })
    }

    // 1. Check if the patient is already in the queue
    const existingQueue = await prisma.queue.findFirst({
      where: { patientId: patientId }
    })

    if (existingQueue) {
      // 2. Update existing queue record to WAITING
      await prisma.queue.update({
        where: { id: existingQueue.id },
        data: { 
          status: status || 'WAITING',
          updatedAt: new Date() 
        }
      })
    } else {
      // 3. If for some reason they aren't in queue, create a new entry
      await prisma.queue.create({
        data: {
          patientId: patientId,
          status: 'WAITING',
          position: 0 // Or handle your queue logic here
        }
      })
    }

    return NextResponse.json({ message: 'Patient re-queued successfully' }, { status: 200 })
  } catch (error) {
    console.error('Requeue API Error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}