import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const patients = await prisma.patient.findMany({
    include: { queue: true }, // Join the queue table
    orderBy: { registeredAt: 'desc' }
  })

  // Flatten the response so frontend doesn't have to do p.queue.status
  const flattened = patients.map(p => ({
    ...p,
    status: p.queue?.status || null,
    queuePosition: p.queue?.position || null
  }))

  return NextResponse.json({ patients: flattened })
}