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

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find the subscription
      const subscription = await tx.subscription.findFirst({
        where: { id, libraryId },
        select: { id: true, status: true, studentId: true },
      });

      if (!subscription) {
        throw new Error('Subscription not found.');
      }

      if (subscription.status !== 'ACTIVE') {
        throw new Error('Only active subscriptions can be cancelled.');
      }

      // 2. Cancel the subscription
      const cancelled = await tx.subscription.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          student: {
            select: { id: true, name: true, phone: true },
          },
          plan: {
            select: { id: true, name: true, durationDays: true, pricePaise: true },
          },
        },
      });

      // 3. Check if student has any other active subscriptions
      const otherActive = await tx.subscription.count({
        where: {
          studentId: subscription.studentId,
          libraryId,
          status: 'ACTIVE',
        },
      });

      // 4. If no other active subscriptions, set student to EXPIRED
      if (otherActive === 0) {
        await tx.student.update({
          where: { id: subscription.studentId },
          data: { status: 'EXPIRED' },
        });
      }

      return cancelled;
    });

    return NextResponse.json(
      apiSuccess(result, 'Subscription cancelled successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Cancel subscription error:', error);
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json(apiError(message), { status: 400 });
  }
}
