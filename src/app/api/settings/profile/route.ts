import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/validation';
import { apiSuccess, apiError } from '@/lib/utils';

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
    const { userId, libraryId } = getAuthHeaders(request);
    if (!libraryId || !userId) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, libraryId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        library: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            maxCapacity: true,
            status: true,
            trialEndsAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(apiError('User not found'), { status: 404 });
    }

    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      library: {
        id: user.library.id,
        name: user.library.name,
        address: user.library.address,
        phone: user.library.phone,
        maxCapacity: user.library.maxCapacity,
        status: user.library.status,
        trialEndsAt: user.library.trialEndsAt.toISOString(),
        createdAt: user.library.createdAt.toISOString(),
      },
    };

    return NextResponse.json(apiSuccess(profile), { status: 200 });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, libraryId } = getAuthHeaders(request);
    if (!libraryId || !userId) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.');
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      return NextResponse.json(apiError('Validation failed', errors), { status: 400 });
    }

    const { libraryName, ownerName, phone, address } = parsed.data;

    // Update in a transaction
    await prisma.$transaction(async (tx) => {
      // Update library fields
      const libraryUpdate: Record<string, unknown> = {};
      if (libraryName !== undefined) libraryUpdate.name = libraryName;
      if (address !== undefined) libraryUpdate.address = address;
      if (phone !== undefined) libraryUpdate.phone = phone;

      if (Object.keys(libraryUpdate).length > 0) {
        await tx.library.update({
          where: { id: libraryId },
          data: libraryUpdate,
        });
      }

      // Update user fields
      const userUpdate: Record<string, unknown> = {};
      if (ownerName !== undefined) userUpdate.name = ownerName;
      if (phone !== undefined) userUpdate.phone = phone;

      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userUpdate,
        });
      }
    });

    // Fetch updated profile
    const user = await prisma.user.findFirst({
      where: { id: userId, libraryId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        library: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            maxCapacity: true,
            status: true,
            trialEndsAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(apiError('User not found'), { status: 404 });
    }

    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      library: {
        id: user.library.id,
        name: user.library.name,
        address: user.library.address,
        phone: user.library.phone,
        maxCapacity: user.library.maxCapacity,
        status: user.library.status,
        trialEndsAt: user.library.trialEndsAt.toISOString(),
        createdAt: user.library.createdAt.toISOString(),
      },
    };

    return NextResponse.json(
      apiSuccess(profile, 'Profile updated successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}
