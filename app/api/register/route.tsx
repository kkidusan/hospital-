// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-long-random-secret-change-this-2026'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json()

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const validRoles = ['ADMIN', 'RECEPTION_TRIAGE', 'SPECIALIST', 'LABORATORY']
    const selectedRole = validRoles.includes(role) ? role : 'RECEPTION_TRIAGE'

    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 12)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: selectedRole,           // ← this must match enum exactly
      },
      select: { id: true, name: true, email: true, role: true },
    })

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json(
      {
        message: 'Registered and logged in!',
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 }
    )

    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}