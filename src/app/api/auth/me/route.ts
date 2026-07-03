import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticateRequest(request);

    if (!authUser) {
      return NextResponse.json(
        apiError('Unauthorized. Please login.'),
        { status: 401 }
      );
    }

    // Fetch full user profile with library
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        library: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            maxCapacity: true,
            status: true,
            trialEndsAt: true,
            createdAt: true,
            billing: {
              select: {
                endDate: true,
                status: true,
                id: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        apiError('User not found.'),
        { status: 404 }
      );
    }

    const now = new Date();

    // Live expiry check: trial
    if (user.library.status === 'TRIAL' && user.library.trialEndsAt < now) {
      await prisma.library.update({
        where: { id: user.library.id },
        data: { status: 'EXPIRED' },
      });
      user.library.status = 'EXPIRED';
    }

    // Live expiry check: billing
    if (
      user.library.billing &&
      user.library.billing.status === 'ACTIVE' &&
      user.library.billing.endDate < now
    ) {
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
    }

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

    return NextResponse.json(apiSuccess(profile), { status: 200 });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}
