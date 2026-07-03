import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ─── Inline JWT verification (Edge-compatible, no Prisma dependency) ────

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

interface JWTPayload {
  userId: string;
  libraryId: string;
  email: string;
  role: string;
}

async function verifyTokenEdge(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('ligital_token')?.value;

  if (!token) {
    // API routes return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    // Page routes redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify JWT
  const payload = await verifyTokenEdge(token);
  if (!payload) {
    // Clear invalid cookie
    const response = pathname.startsWith('/api/')
      ? NextResponse.json(
          { success: false, message: 'Invalid or expired token' },
          { status: 401 }
        )
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.set('ligital_token', '', { maxAge: 0 });
    return response;
  }

  // Attach user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-library-id', payload.libraryId);
  requestHeaders.set('x-user-email', payload.email);
  requestHeaders.set('x-user-role', payload.role);

  // If authenticated user tries to access login/register, redirect to dashboard
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
