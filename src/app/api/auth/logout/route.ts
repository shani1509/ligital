import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';

export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json(
      apiSuccess(null, 'Logged out successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      apiError('An unexpected error occurred.'),
      { status: 500 }
    );
  }
}
