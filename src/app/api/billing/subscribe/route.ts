import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subscribeBillingSchema } from '@/lib/validation';
import { apiSuccess, apiError, PLATFORM_PLANS, addDays } from '@/lib/utils';

function getAuthHeaders(request: NextRequest) {
  return {
    userId: request.headers.get('x-user-id') || '',
    libraryId: request.headers.get('x-library-id') || '',
    email: request.headers.get('x-user-email') || '',
    role: request.headers.get('x-user-role') || '',
  };
}

export async function POST(request: NextRequest) {
  try {
    const { libraryId } = getAuthHeaders(request);
    if (!libraryId) {
      return NextResponse.json(apiError('Unauthorized'), { status: 401 });
    }

    const body = await request.json();
    const parsed = subscribeBillingSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.');
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      }
      return NextResponse.json(apiError('Validation failed', errors), { status: 400 });
    }

    const { planType } = parsed.data;
    const planConfig = PLATFORM_PLANS[planType];

    const startDate = new Date();
    const endDate = addDays(startDate, planConfig.durationDays);

    // Mock payment: always succeeds
    // In production, this would integrate with Razorpay/Stripe

    const result = await prisma.$transaction(async (tx) => {
      // Upsert the platform billing record
      const billing = await tx.platformBilling.upsert({
        where: { libraryId },
        update: {
          planType,
          amountPaise: planConfig.pricePaise,
          startDate,
          endDate,
          status: 'ACTIVE',
        },
        create: {
          libraryId,
          planType,
          amountPaise: planConfig.pricePaise,
          startDate,
          endDate,
          status: 'ACTIVE',
        },
      });

      // Set library status to ACTIVE
      await tx.library.update({
        where: { id: libraryId },
        data: { status: 'ACTIVE' },
      });

      return billing;
    });

    const response = {
      id: result.id,
      planType: result.planType,
      amountPaise: result.amountPaise,
      startDate: result.startDate.toISOString(),
      endDate: result.endDate.toISOString(),
      status: result.status,
    };

    return NextResponse.json(
      apiSuccess(response, `Successfully subscribed to ${planConfig.label} plan`),
      { status: 200 }
    );
  } catch (error) {
    console.error('Billing subscribe error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}
