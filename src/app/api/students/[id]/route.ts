import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { updateStudentSchema } from '@/lib/validation';
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

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { libraryId } = getAuthHeaders(request);
    if (!libraryId) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const { id } = await params;

    const student = await prisma.student.findFirst({
      where: { id, libraryId },
      include: {
        seat: {
          select: { id: true, seatNumber: true },
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                durationDays: true,
                pricePaise: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(apiError('Student not found'), { status: 404 });
    }

    return NextResponse.json(apiSuccess(student), { status: 200 });
  } catch (error) {
    console.error('Get student error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json();
    const parsed = updateStudentSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.');
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      return NextResponse.json(apiError('Validation failed', errors), { status: 400 });
    }

    // Check student exists and belongs to this library
    const existingStudent = await prisma.student.findFirst({
      where: { id, libraryId },
      select: { id: true },
    });

    if (!existingStudent) {
      return NextResponse.json(apiError('Student not found'), { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.email !== undefined) updateData.email = parsed.data.email || null;
    if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
    if (parsed.data.address !== undefined) updateData.address = parsed.data.address || null;

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        seat: {
          select: { id: true, seatNumber: true },
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            plan: {
              select: { id: true, name: true, durationDays: true },
            },
          },
        },
      },
    });

    return NextResponse.json(
      apiSuccess(updatedStudent, 'Student updated successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Check student exists and belongs to this library
    const student = await prisma.student.findFirst({
      where: { id, libraryId },
      include: {
        seat: { select: { id: true } },
      },
    });

    if (!student) {
      return NextResponse.json(apiError('Student not found'), { status: 404 });
    }

    // Mark as LEFT and free their seat in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Mark student as LEFT
      await tx.student.update({
        where: { id },
        data: { status: 'LEFT' },
      });

      // 2. Free their seat
      if (student.seat) {
        await tx.seat.update({
          where: { id: student.seat.id },
          data: {
            status: 'AVAILABLE',
            studentId: null,
          },
        });
      }

      // 3. Cancel any active subscriptions
      await tx.subscription.updateMany({
        where: {
          studentId: id,
          libraryId,
          status: 'ACTIVE',
        },
        data: { status: 'CANCELLED' },
      });
    });

    return NextResponse.json(
      apiSuccess(null, 'Student marked as left and seat freed'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}
