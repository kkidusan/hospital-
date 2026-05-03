import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-long-random-secret-key-change-this-in-production-2026';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, specialty } = await req.json();

    // 1. Input Validation
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

    // 2. Updated valid roles to match UI and Prisma
    const validRoles: string[] = [
      'ADMIN',
      'RECEPTION',
      'TRIAGE',
      'SPECIALIST',
      'LABORATORY',
      'RADIOLOGY',
      'BILLING',
      'FINANCIAL',
      'PHARMACIST',  // Added
      'INVENTORY',   // Added
    ];

    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role: ${role}` }, { status: 400 });
    }

    // 3. Specialty logic
    let finalSpecialty: string | null = null;
    if (role === 'SPECIALIST') {
      if (!specialty?.trim()) {
        return NextResponse.json(
          { error: "Specialty is required for Specialist (Doctor) role" },
          { status: 400 }
        );
      }
      finalSpecialty = specialty.trim();
    }

    // 4. Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password.trim(), 12);

    // 6. Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: role as any,
        specialty: finalSpecialty,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialty: true,
      },
    });

    // 7. Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      {
        message: 'Staff account created successfully!',
        user,
      },
      { status: 201 }
    );

    // 8. Set secure httpOnly cookie
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}