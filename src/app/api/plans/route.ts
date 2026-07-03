import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createPlanSchema } from '@/lib/validation';
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

    const plans = await prisma.plan.findMany({
      where: { libraryId },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(apiSuccess(plans), { status: 200 });
  } catch (error) {
    console.error('Plans list error:', error);
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
    const parsed = createPlanSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.');
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      return NextResponse.json(apiError('Validation failed', errors), { status: 400 });
    }

    const { name, durationDays, pricePaise } = parsed.data;

    const plan = await prisma.plan.create({
      data: {
        libraryId,
        name,
        durationDays,
        pricePaise,
        isActive: true,
      },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    return NextResponse.json(
      apiSuccess(plan, 'Plan created successfully'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create plan error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}
