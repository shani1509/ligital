import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';
import { z } from 'zod';

function getAuthHeaders(request: NextRequest) {
  return {
    userId: request.headers.get('x-user-id') || '',
    libraryId: request.headers.get('x-library-id') || '',
    email: request.headers.get('x-user-email') || '',
    role: request.headers.get('x-user-role') || '',
  };
}

const assignSeatSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
});

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

    const body = await request.json();
    const parsed = assignSeatSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.');
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      return NextResponse.json(apiError('Validation failed', errors), { status: 400 });
    }

    const { studentId } = parsed.data;

    // Use transaction for atomicity and row locking
    const updatedSeat = await prisma.$transaction(async (tx) => {
      // 1. Verify seat belongs to library and is available
      const seat = await tx.seat.findFirst({
        where: { id, libraryId },
      });

      if (!seat) {
        throw new Error('Seat not found.');
      }

      if (seat.status === 'OCCUPIED') {
        throw new Error('Seat is already occupied.');
      }

      // 2. Verify student belongs to library
      const student = await tx.student.findFirst({
        where: { id: studentId, libraryId },
        include: {
          seat: { select: { id: true } },
        },
      });

      if (!student) {
        throw new Error('Student not found.');
      }

      // 3. If student already has a seat, release the old one
      if (student.seat) {
        await tx.seat.update({
          where: { id: student.seat.id },
          data: { status: 'AVAILABLE', studentId: null },
        });
      }

      // 4. Assign the new seat
      return tx.seat.update({
        where: { id },
        data: {
          status: 'OCCUPIED',
          studentId,
        },
        include: {
          student: {
            select: { id: true, name: true, phone: true, status: true },
          },
        },
      });
    });

    return NextResponse.json(
      apiSuccess(updatedSeat, 'Seat assigned successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Assign seat error:', error);
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json(apiError(message), { status: 400 });
  }
}
