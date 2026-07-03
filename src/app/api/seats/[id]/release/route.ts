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

    // Use transaction for atomicity
    const updatedSeat = await prisma.$transaction(async (tx) => {
      const seat = await tx.seat.findFirst({
        where: { id, libraryId },
      });

      if (!seat) {
        throw new Error('Seat not found.');
      }

      if (seat.status === 'AVAILABLE') {
        throw new Error('Seat is already available.');
      }

      return tx.seat.update({
        where: { id },
        data: {
          status: 'AVAILABLE',
          studentId: null,
        },
        include: {
          student: {
            select: { id: true, name: true, phone: true, status: true },
          },
        },
      });
    });

    return NextResponse.json(
      apiSuccess(updatedSeat, 'Seat released successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Release seat error:', error);
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json(apiError(message), { status: 400 });
  }
}
