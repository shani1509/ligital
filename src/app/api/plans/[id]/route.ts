import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { updatePlanSchema } from '@/lib/validation';
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
    const parsed = updatePlanSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.');
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      return NextResponse.json(apiError('Validation failed', errors), { status: 400 });
    }

    // Verify plan belongs to this library
    const existingPlan = await prisma.plan.findFirst({
      where: { id, libraryId },
      select: { id: true },
    });

    if (!existingPlan) {
      return NextResponse.json(apiError('Plan not found'), { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.durationDays !== undefined) updateData.durationDays = parsed.data.durationDays;
    if (parsed.data.pricePaise !== undefined) updateData.pricePaise = parsed.data.pricePaise;

    const updatedPlan = await prisma.plan.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    return NextResponse.json(
      apiSuccess(updatedPlan, 'Plan updated successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update plan error:', error);
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

    // Verify plan belongs to this library
    const plan = await prisma.plan.findFirst({
      where: { id, libraryId },
      select: { id: true },
    });

    if (!plan) {
      return NextResponse.json(apiError('Plan not found'), { status: 404 });
    }

    // Check for active subscriptions before deactivating
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        planId: id,
        libraryId,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriptions > 0) {
      return NextResponse.json(
        apiError(
          `Cannot deactivate plan: ${activeSubscriptions} active subscription(s) still using this plan.`
        ),
        { status: 409 }
      );
    }

    // Soft-delete: set isActive to false
    const deactivatedPlan = await prisma.plan.update({
      where: { id },
      data: { isActive: false },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    return NextResponse.json(
      apiSuccess(deactivatedPlan, 'Plan deactivated successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete plan error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}
