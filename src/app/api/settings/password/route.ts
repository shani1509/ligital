import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { changePasswordSchema } from '@/lib/validation';
import { apiSuccess, apiError } from '@/lib/utils';

function getAuthHeaders(request: NextRequest) {
  return {
    userId: request.headers.get('x-user-id') || '',
    libraryId: request.headers.get('x-library-id') || '',
    email: request.headers.get('x-user-email') || '',
    role: request.headers.get('x-user-role') || '',
  };
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, libraryId } = getAuthHeaders(request);
    if (!libraryId || !userId) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.');
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      return NextResponse.json(apiError('Validation failed', errors), { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    // Fetch current user
    const user = await prisma.user.findFirst({
      where: { id: userId, libraryId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json(apiError('User not found'), { status: 404 });
    }

    // Verify current password
    const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json(
        apiError('Current password is incorrect.'),
        { status: 401 }
      );
    }

    // Prevent reusing the same password
    const isSamePassword = await verifyPassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      return NextResponse.json(
        apiError('New password must be different from the current password.'),
        { status: 400 }
      );
    }

    // Hash and update
    const newHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return NextResponse.json(
      apiSuccess(null, 'Password changed successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}
