import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError, daysUntil } from '@/lib/utils';

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
      select: { status: true },
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

    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        libraryId,
        status: 'ACTIVE',
        endDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        student: {
          select: { name: true },
        },
        plan: {
          select: { name: true },
        },
      },
      orderBy: { endDate: 'asc' },
    });

    const alerts = expiringSubscriptions.map((sub) => {
      const remaining = daysUntil(sub.endDate);
      return {
        id: sub.id,
        studentName: sub.student.name,
        planName: sub.plan.name,
        expiryDate: sub.endDate.toISOString(),
        daysRemaining: remaining,
        type: remaining <= 3 ? ('danger' as const) : ('warning' as const),
      };
    });

    return NextResponse.json(apiSuccess(alerts), { status: 200 });
  } catch (error) {
    console.error('Dashboard alerts error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}
