import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

function getAuthHeaders(request: NextRequest) {
  return {
    libraryId: request.headers.get('x-library-id') || '',
  };
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { libraryId } = getAuthHeaders(request);
    if (!libraryId) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { planId, seatNumber } = body;

    if (!planId) {
      return NextResponse.json(apiError('Plan ID is required'), { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: { id, libraryId },
      include: { seat: true }
    });

    if (!student) {
      return NextResponse.json(apiError('Student not found'), { status: 404 });
    }

    const plan = await prisma.plan.findFirst({
      where: { id: planId, libraryId, isActive: true }
    });

    if (!plan) {
      return NextResponse.json(apiError('Invalid or inactive plan'), { status: 404 });
    }

    // Cancel any existing active subscriptions for this student
    await prisma.subscription.updateMany({
      where: { studentId: id, libraryId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' }
    });

    const startDate = new Date();
    // Add plan duration days directly 
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    await prisma.$transaction(async (tx) => {
      // 1. Handle seat assignment
      let assignedSeatId = student.seat?.id;
      
      // If a specific seat is requested
      if (seatNumber !== undefined && seatNumber !== null && seatNumber !== '') {
        const parsedSeatNumber = parseInt(seatNumber, 10);
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
        
        assignedSeatId = requestedSeat.id;
      } 
      // Auto-assign if requested and currently no seat, or if explicitly requested "auto"
      else if (!seatNumber && !assignedSeatId) {
        const availableSeat = await tx.seat.findFirst({
          where: { libraryId, status: 'AVAILABLE' },
          orderBy: { seatNumber: 'asc' }
        });
        
        if (!availableSeat) {
          throw new Error('No available seats in the library');
        }
        
        await tx.seat.update({
          where: { id: availableSeat.id },
          data: { status: 'OCCUPIED', studentId: student.id }
        });
      }

      // 2. Create subscription
      await tx.subscription.create({
        data: {
          libraryId,
          studentId: id,
          planId,
          startDate,
          endDate,
          amountPaidPaise: plan.pricePaise,
          status: 'ACTIVE'
        }
      });

      // 3. Update student status
      await tx.student.update({
        where: { id },
        data: { status: 'ACTIVE' }
      });
    });

    return NextResponse.json(apiSuccess(null, 'Membership renewed successfully'), { status: 200 });
  } catch (error: any) {
    console.error('Renew membership error:', error);
    return NextResponse.json(
      apiError(error.message || 'An unexpected error occurred.'),
      { status: 500 }
    );
  }
}
