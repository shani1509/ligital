import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createStudentSchema } from '@/lib/validation';
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
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || '';
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { libraryId };

    if (status && ['ACTIVE', 'EXPIRED', 'LEFT'].includes(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          seat: {
            select: {
              id: true,
              seatNumber: true,
            },
          },
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              plan: {
                select: {
                  id: true,
                  name: true,
                  durationDays: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.student.count({ where }),
    ]);

    const result = {
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(apiSuccess(result), { status: 200 });
  } catch (error) {
    console.error('Students list error:', error);
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
    const parsed = createStudentSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.');
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      return NextResponse.json(apiError('Validation failed', errors), { status: 400 });
    }

    const { name, email, phone, address, seatNumber, planId } = parsed.data;

    // Create student in a transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the student
      const student = await tx.student.create({
        data: {
          libraryId,
          name,
          email: email || null,
          phone,
          address: address || null,
          status: planId ? 'ACTIVE' : 'EXPIRED',
        },
      });

      // 2. Handle seat assignment
      if (seatNumber) {
        // Assign specific seat — use findFirst with lock-like uniqueness check
        const seat = await tx.seat.findUnique({
          where: {
            libraryId_seatNumber: {
              libraryId,
              seatNumber,
            },
          },
        });

        if (!seat) {
          throw new Error(`Seat ${seatNumber} does not exist.`);
        }

        if (seat.status === 'OCCUPIED') {
          throw new Error(`Seat ${seatNumber} is already occupied.`);
        }

        await tx.seat.update({
          where: { id: seat.id },
          data: {
            status: 'OCCUPIED',
            studentId: student.id,
          },
        });
      } else {
        // Auto-assign first available seat
        const availableSeat = await tx.seat.findFirst({
          where: {
            libraryId,
            status: 'AVAILABLE',
          },
          orderBy: { seatNumber: 'asc' },
        });

        if (availableSeat) {
          await tx.seat.update({
            where: { id: availableSeat.id },
            data: {
              status: 'OCCUPIED',
              studentId: student.id,
            },
          });
        }
        // If no seats available, student is created without a seat
      }

      // 3. Handle plan subscription
      if (planId) {
        const plan = await tx.plan.findFirst({
          where: {
            id: planId,
            libraryId,
            isActive: true,
          },
        });

        if (!plan) {
          throw new Error('Plan not found or inactive.');
        }

        const startDate = new Date();
        const endDate = addDays(startDate, plan.durationDays);

        await tx.subscription.create({
          data: {
            libraryId,
            studentId: student.id,
            planId: plan.id,
            startDate,
            endDate,
            status: 'ACTIVE',
            amountPaidPaise: plan.pricePaise,
          },
        });
      }

      // Fetch the full student record with relations
      return tx.student.findUnique({
        where: { id: student.id },
        include: {
          seat: {
            select: { id: true, seatNumber: true },
          },
          subscriptions: {
            include: {
              plan: {
                select: { id: true, name: true, durationDays: true },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(
      apiSuccess(result, 'Student created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create student error:', error);
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json(apiError(message), { status: 400 });
  }
}
