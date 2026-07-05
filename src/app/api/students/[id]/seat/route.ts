import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

function getAuthHeaders(request: NextRequest) {
  return {
    libraryId: request.headers.get('x-library-id') || '',
  };
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { libraryId } = getAuthHeaders(request);
    if (!libraryId) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { newSeatNumber } = body;

    if (!newSeatNumber) {
      return NextResponse.json(apiError('New seat number is required'), { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: { id, libraryId },
      include: { seat: true }
    });

    if (!student) {
      return NextResponse.json(apiError('Student not found'), { status: 404 });
    }

    if (student.status !== 'ACTIVE') {
      return NextResponse.json(apiError('Cannot assign seat to inactive student'), { status: 400 });
    }

    const parsedSeatNumber = parseInt(newSeatNumber, 10);

    // If they selected the seat they already have
    if (student.seat && student.seat.seatNumber === parsedSeatNumber) {
      return NextResponse.json(apiSuccess(null, 'Student is already assigned to this seat'), { status: 200 });
    }

    await prisma.$transaction(async (tx) => {
      const requestedSeat = await tx.seat.findFirst({
        where: { libraryId, seatNumber: parsedSeatNumber, status: 'AVAILABLE' }
      });
      
      if (!requestedSeat) {
        throw new Error(`Seat #${parsedSeatNumber} is no longer available`);
      }

      // Free old seat if exists
      if (student.seat) {
        await tx.seat.update({
          where: { id: student.seat.id },
          data: { status: 'AVAILABLE', studentId: null }
        });
      }

      // Assign new seat
      await tx.seat.update({
        where: { id: requestedSeat.id },
        data: { status: 'OCCUPIED', studentId: student.id }
      });
    });

    return NextResponse.json(apiSuccess(null, 'Seat assigned successfully'), { status: 200 });
  } catch (error: any) {
    console.error('Assign seat error:', error);
    return NextResponse.json(
      apiError(error.message || 'An unexpected error occurred.'),
      { status: 500 }
    );
  }
}
