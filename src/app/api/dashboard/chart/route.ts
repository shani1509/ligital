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

    // Get revenue data for the last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6); // Include today = 7 days
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const subscriptions = await prisma.subscription.findMany({
      where: {
        libraryId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
        amountPaidPaise: true,
      },
    });

    // Build a map of date → total revenue
    const revenueByDate = new Map<string, number>();

    // Initialize all 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      revenueByDate.set(dateKey, 0);
    }

    // Sum up subscriptions by date
    for (const sub of subscriptions) {
      const dateKey = sub.createdAt.toISOString().split('T')[0];
      const current = revenueByDate.get(dateKey) || 0;
      revenueByDate.set(dateKey, current + sub.amountPaidPaise);
    }

    // Convert to chart data format
    const chartData = Array.from(revenueByDate.entries()).map(([date, value]) => {
      const d = new Date(date);
      const label = d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
      return { label, value, date };
    });

    return NextResponse.json(apiSuccess(chartData), { status: 200 });
  } catch (error) {
    console.error('Dashboard chart error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}
