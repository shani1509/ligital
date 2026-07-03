import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

function getAuthHeaders(request: NextRequest) {
  return {
    userId: request.headers.get('x-user-id') || '',
    libraryId: request.headers.get('x-library-id') || '',
    email: request.headers.get('x-user-email') || '',
    role: request.headers.get('x-user-role') || '',
  };
}

export async function GET(request: NextRequest) {
  try {
    const { libraryId } = getAuthHeaders(request);
    if (!libraryId) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    // Check library status
    const library = await prisma.library.findUnique({
      where: { id: libraryId },
      select: { status: true, maxCapacity: true },
    });

    if (!library) {
      return NextResponse.json(apiError('Library not found'), { status: 404 });
    }

    if (library.status === 'EXPIRED') {
      return NextResponse.json(
        apiError('Your subscription has expired. Please renew to continue.'),
        { status: 403 }
      );
    }

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run all queries in parallel
    const [
      totalStudents,
      activeStudents,
      expiringSoonCount,
      expiredStudents,
      occupiedSeats,
      totalRevenueResult,
      monthlyRevenueResult,
    ] = await Promise.all([
      // Total students (not LEFT)
      prisma.student.count({
        where: { libraryId, status: { not: 'LEFT' } },
      }),

      // Active students
      prisma.student.count({
        where: { libraryId, status: 'ACTIVE' },
      }),

      // Subscriptions expiring within 7 days
      prisma.subscription.count({
        where: {
          libraryId,
          status: 'ACTIVE',
          endDate: {
            gte: now,
            lte: sevenDaysFromNow,
          },
        },
      }),

      // Expired students
      prisma.student.count({
        where: { libraryId, status: 'EXPIRED' },
      }),

      // Occupied seats
      prisma.seat.count({
        where: { libraryId, status: 'OCCUPIED' },
      }),

      // Total revenue (all time)
      prisma.subscription.aggregate({
        where: { libraryId },
        _sum: { amountPaidPaise: true },
      }),

      // Monthly revenue (this month)
      prisma.subscription.aggregate({
        where: {
          libraryId,
          createdAt: { gte: startOfMonth },
        },
        _sum: { amountPaidPaise: true },
      }),
    ]);

    const stats = {
      totalStudents,
      activeStudents,
      expiringSoon: expiringSoonCount,
      expiredStudents,
      totalSeats: library.maxCapacity,
      occupiedSeats,
      totalRevenue: totalRevenueResult._sum.amountPaidPaise || 0,
      monthlyRevenue: monthlyRevenueResult._sum.amountPaidPaise || 0,
    };

    return NextResponse.json(apiSuccess(stats), { status: 200 });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}
