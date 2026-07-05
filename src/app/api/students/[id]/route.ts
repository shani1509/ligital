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

    // Decrypt Aadhar if it exists
    let decryptedAadhar = student.aadharNumber;
    if (decryptedAadhar) {
      try {
        const { decryptAadhar } = await import('@/lib/crypto');
        decryptedAadhar = decryptAadhar(decryptedAadhar);
      } catch (err) {
        console.error('Failed to decrypt Aadhar', err);
      }
    }

    const responseData = {
      ...student,
      aadharNumber: decryptedAadhar,
    };

    return NextResponse.json(apiSuccess(responseData), { status: 200 });
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { libraryId } = getAuthHeaders(request);
    if (!libraryId) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Extract only phone and email to prevent malicious updates
    const phone = body.phone;
    const email = body.email;

    if (!phone) {
      return NextResponse.json(apiError('Phone number is required'), { status: 400 });
    }

    // Verify student exists and belongs to library
    const existingStudent = await prisma.student.findFirst({
      where: { id, libraryId },
      select: { id: true },
    });

    if (!existingStudent) {
      return NextResponse.json(apiError('Student not found'), { status: 404 });
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: { phone, email: email || null },
    });

    return NextResponse.json(
      apiSuccess(updatedStudent, 'Profile updated successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Patch student error:', error);
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

    // Permanently delete student and free their seat in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Free their seat if they have one
      if (student.seat) {
        await tx.seat.update({
          where: { id: student.seat.id },
          data: {
            status: 'AVAILABLE',
            studentId: null,
          },
        });
      }

      // 2. Permanently delete the student (subscriptions cascade automatically)
      await tx.student.delete({
        where: { id },
      });
    });

    return NextResponse.json(
      apiSuccess(null, 'Student permanently deleted'),
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
