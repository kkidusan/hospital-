import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      fullName, age, ageUnit = 'years', sex, phone, address, region = 'Addis Ababa'
    } = body

    if (!fullName?.trim() || !age || !sex) {
      return NextResponse.json({ error: 'Full name, age and sex are required' }, { status: 400 })
    }

    const year = new Date().getFullYear()
    const random = Math.floor(1000 + Math.random() * 9000)
    const mrn = `MRN-${year}-${random}`

    // Create Patient + Queue in one transaction
    const patient = await prisma.patient.create({
      data: {
        mrn,
        fullName: fullName.trim(),
        age: parseInt(age),
        ageUnit,
        sex,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        region,
      },
      include: {
        queue: true
      }
    })

    // Auto-create Queue entry
    await prisma.queue.create({
      data: {
        patientId: patient.id,
        status: 'WAITING',
        position: await prisma.queue.count() + 1
      }
    })

    return NextResponse.json({ patient: { ...patient, mrn } }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to register patient' }, { status: 500 })
  }
}