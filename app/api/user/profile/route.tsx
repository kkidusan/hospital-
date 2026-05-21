import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs'; // Ensure you have bcryptjs installed for secure password comparison

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-long-random-secret-key';

// 1. GET - Fetch Profile Data
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialty: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name || 'Abebe Kebede',
      email: user.email,
      role: user.role || 'RECEPTION',
      specialty: user.specialty || 'Generalist',
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 2. PUT - Update Profile & Password Securely
export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const body = await req.json();

    const { name, specialty, currentPassword, newPassword, isPasswordUpdate } = body;

    // Handle Password Change Request Flow Specifically
    if (isPasswordUpdate) {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Missing required password fields' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Check current password authenticity
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
      }

      // Hash your clean new password input
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
      });

      return NextResponse.json({ message: 'Password updated successfully' });
    }

    // Handle Standard Identity Info Update Flow
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: name,
        specialty: specialty,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update operation error:', error);
    return NextResponse.json({ error: 'Failed to complete update' }, { status: 500 });
  }
}