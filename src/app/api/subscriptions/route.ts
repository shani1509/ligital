import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSubscriptionSchema } from '@/lib/validation';
import { apiSuccess, apiError, addDays } from '@/lib/utils';

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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const status = searchParams.get('status') || '';
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { libraryId };

    if (status && ['ACTIVE', 'EXPIRED', 'CANCELLED'].includes(status)) {
      where.status = status;
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              durationDays: true,
              pricePaise: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.subscription.count({ where }),
    ]);

    const result = {
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(apiSuccess(result), { status: 200 });
  } catch (error) {
    console.error('Subscriptions list error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = createSubscriptionSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.');
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      return NextResponse.json(apiError('Validation failed', errors), { status: 400 });
    }

    const { studentId, planId } = parsed.data;

    const subscription = await prisma.$transaction(async (tx) => {
      // 1. Verify student belongs to this library
      const student = await tx.student.findFirst({
        where: { id: studentId, libraryId },
        select: { id: true, status: true },
      });

      if (!student) {
        throw new Error('Student not found.');
      }

      if (student.status === 'LEFT') {
        throw new Error('Cannot create subscription for a student who has left.');
      }

      // 2. Verify plan belongs to this library and is active
      const plan = await tx.plan.findFirst({
        where: { id: planId, libraryId, isActive: true },
      });

      if (!plan) {
        throw new Error('Plan not found or inactive.');
      }

      // 3. Expire any currently active subscriptions for this student
      await tx.subscription.updateMany({
        where: {
          studentId,
          libraryId,
          status: 'ACTIVE',
        },
        data: { status: 'EXPIRED' },
      });

      // 4. Create new subscription
      const startDate = new Date();
      const endDate = addDays(startDate, plan.durationDays);

      const newSub = await tx.subscription.create({
        data: {
          libraryId,
          studentId,
          planId: plan.id,
          startDate,
          endDate,
          status: 'ACTIVE',
          amountPaidPaise: plan.pricePaise,
        },
        include: {
          student: {
            select: { id: true, name: true, phone: true },
          },
          plan: {
            select: { id: true, name: true, durationDays: true, pricePaise: true },
          },
        },
      });

      // 5. Update student status to ACTIVE
      await tx.student.update({
        where: { id: studentId },
        data: { status: 'ACTIVE' },
      });

      return newSub;
    });

    return NextResponse.json(
      apiSuccess(subscription, 'Subscription created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create subscription error:', error);
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json(apiError(message), { status: 400 });
  }
}
