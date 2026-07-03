import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  verifyPassword,
  createToken,
  setAuthCookie,
  checkRateLimit,
} from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`login:${ip}`, 10, 60000)) {
      return NextResponse.json(
        apiError('Too many login attempts. Please try again later.'),
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.');
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      return NextResponse.json(apiError('Validation failed', errors), { status: 400 });
    }

    const { email, password } = parsed.data;

    // Find user with library info
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        library: {
          include: {
            billing: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        apiError('Invalid email or password.'),
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        apiError('Invalid email or password.'),
        { status: 401 }
      );
    }

    const now = new Date();

    // Check if trial has expired
    if (user.library.status === 'TRIAL' && user.library.trialEndsAt < now) {
      await prisma.library.update({
        where: { id: user.library.id },
        data: { status: 'EXPIRED' },
      });
      user.library.status = 'EXPIRED';
    }

    // Check if platform billing has expired
    if (user.library.billing && user.library.billing.endDate < now) {
      if (user.library.billing.status === 'ACTIVE') {
        await prisma.$transaction([
          prisma.platformBilling.update({
            where: { id: user.library.billing.id },
            data: { status: 'EXPIRED' },
          }),
          prisma.library.update({
            where: { id: user.library.id },
            data: { status: 'EXPIRED' },
          }),
        ]);
        user.library.status = 'EXPIRED';
        user.library.billing.status = 'EXPIRED';
      }
    }

    // Create JWT
    const token = await createToken({
      userId: user.id,
      libraryId: user.libraryId,
      email: user.email,
      role: user.role,
    });

    // Set cookie
    await setAuthCookie(token);

    // Return user profile data
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      library: {
        id: user.library.id,
        name: user.library.name,
        address: user.library.address,
        phone: user.library.phone,
        maxCapacity: user.library.maxCapacity,
        status: user.library.status,
        trialEndsAt: user.library.trialEndsAt.toISOString(),
        createdAt: user.library.createdAt.toISOString(),
      },
    };

    return NextResponse.json(
      apiSuccess(profile, 'Login successful'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred. Please try again.'),
      { status: 500 }
    );
  }
}
