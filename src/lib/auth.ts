import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// ─── Constants ──────────────────────────────────────────

const SALT_ROUNDS = 12;
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);
const COOKIE_NAME = 'ligital_token';
const JWT_EXPIRY = '24h';

// ─── Types ──────────────────────────────────────────────

export interface JWTPayload {
  userId: string;
  libraryId: string;
  email: string;
  role: string;
}

export interface AuthUser {
  userId: string;
  libraryId: string;
  email: string;
  role: string;
  libraryStatus: string;
}

// ─── Password Utilities ─────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── JWT Utilities ──────────────────────────────────────

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ─── Cookie Utilities ───────────────────────────────────

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return token?.value || null;
}

// ─── Auth Middleware Helper ─────────────────────────────

/**
 * Authenticates the request by verifying the JWT token from cookies.
 * Returns the authenticated user with library status, or null if unauthenticated.
 * 
 * CRITICAL: This also checks the library's billing status.
 * If EXPIRED, only billing/auth routes should proceed.
 */
export async function authenticateRequest(
  request?: NextRequest
): Promise<AuthUser | null> {
  let token: string | null = null;

  if (request) {
    // From NextRequest (middleware/API route with request object)
    token = request.cookies.get(COOKIE_NAME)?.value || null;
  } else {
    // From server component or API route without request
    token = await getTokenFromCookies();
  }

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  // Fetch current library status (may have changed since token was issued)
  const library = await prisma.library.findUnique({
    where: { id: payload.libraryId },
    select: { status: true },
  });

  if (!library) return null;

  return {
    userId: payload.userId,
    libraryId: payload.libraryId,
    email: payload.email,
    role: payload.role,
    libraryStatus: library.status,
  };
}

/**
 * Rate limiting store — simple in-memory implementation.
 * In production, use Redis.
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
