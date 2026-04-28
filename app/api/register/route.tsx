// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-long-random-secret-key-change-this-in-production-2026';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, specialty } = await req.json();

    // ────── Input Validation ──────
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Valid roles from Prisma enum
    const validRoles: string[] = [
      'ADMIN',
      'RECEPTION',
      'TRIAGE',
      'SPECIALIST',
      'LABORATORY',
      'RADIOLOGY',
      'BILLING',
      'FINANCIAL',
    ];

    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role selected' }, { status: 400 });
    }

    // Specialty logic - ONLY for SPECIALIST
    let finalSpecialty: string | null = null;

    if (role === 'SPECIALIST') {
      if (!specialty?.trim()) {
        return NextResponse.json(
          { error: "Specialty is required for Specialist (Doctor) role" },
          { status: 400 }
        );
      }
      finalSpecialty = specialty.trim();
    } else {
      // Ensure specialty is null for non-specialists
      finalSpecialty = null;
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password.trim(), 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: role as any,           // Prisma enum type
        specialty: finalSpecialty,   // ← This is now correctly passed
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialty: true,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        specialty: user.specialty,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      {
        message: 'Staff account created successfully!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          specialty: user.specialty,
        },
      },
      { status: 201 }
    );

    // Set secure httpOnly cookie
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);

    // Prisma unique constraint violation (duplicate email)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}