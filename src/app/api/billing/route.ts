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

export async function GET(request: NextRequest) {
  try {
    const { libraryId } = getAuthHeaders(request);
    if (!libraryId) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const billing = await prisma.platformBilling.findUnique({
      where: { libraryId },
      include: {
        library: {
          select: {
            status: true,
            trialEndsAt: true,
          },
        },
      },
    });

    if (!billing) {
      return NextResponse.json(apiError('Billing info not found'), { status: 404 });
    }

    const result = {
      id: billing.id,
      planType: billing.planType,
      amountPaise: billing.amountPaise,
      startDate: billing.startDate.toISOString(),
      endDate: billing.endDate.toISOString(),
      status: billing.status,
      library: {
        status: billing.library.status,
        trialEndsAt: billing.library.trialEndsAt.toISOString(),
      },
    };

    return NextResponse.json(apiSuccess(result), { status: 200 });
  } catch (error) {
    console.error('Billing get error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}
