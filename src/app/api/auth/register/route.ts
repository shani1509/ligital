import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, checkRateLimit } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`register:${ip}`, 5, 60000)) {
      return NextResponse.json(
        apiError('Too many registration attempts. Please try again later.'),
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.');
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      return NextResponse.json(apiError('Validation failed', errors), { status: 400 });
    }

    const {
      libraryName,
      ownerName,
      email,
      password,
      phone,
      address,
      maxCapacity,
      captchaAnswer,
      captchaExpected,
    } = parsed.data;

    // Verify CAPTCHA
    if (captchaAnswer !== captchaExpected) {
      return NextResponse.json(
        apiError('Incorrect CAPTCHA answer. Please try again.'),
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        apiError('An account with this email already exists.'),
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Calculate trial end date (30 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30);

    // Create library + user + seats + platformBilling in a single transaction
    await prisma.$transaction(async (tx) => {
      // 1. Create library
      const library = await tx.library.create({
        data: {
          name: libraryName,
          address,
          phone,
          maxCapacity,
          status: 'TRIAL',
          trialEndsAt,
        },
      });

      // 2. Create owner user
      await tx.user.create({
        data: {
          libraryId: library.id,
          name: ownerName,
          email,
          passwordHash,
          phone,
          role: 'OWNER',
        },
      });

      // 3. Create seats (maxCapacity seats numbered 1..N)
      const seatData = Array.from({ length: maxCapacity }, (_, i) => ({
        libraryId: library.id,
        seatNumber: i + 1,
        status: 'AVAILABLE' as const,
      }));

      await tx.seat.createMany({ data: seatData });

      // 4. Create initial platform billing record (trial)
      await tx.platformBilling.create({
        data: {
          libraryId: library.id,
          planType: 'MONTHLY',
          amountPaise: 0,
          startDate: new Date(),
          endDate: trialEndsAt,
          status: 'ACTIVE',
        },
      });
    });

    return NextResponse.json(
      apiSuccess(null, 'Registration successful! Please login to continue.'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred. Please try again.'),
      { status: 500 }
    );
  }
}
