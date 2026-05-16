import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Use the same fallback secret as next-auth to avoid mismatches when
// NEXTAUTH_SECRET is not set in environment (development fallback).
import { env } from '@/env.mjs';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes server-side
  if (pathname.startsWith('/admin')) {
    // Allow the admin login page and any public admin assets through
    if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
      return NextResponse.next();
    }

    const token = await getToken({ req: request, secret: env.NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'admin') {
      // API callers should receive 401
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // For pages, redirect to admin login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Redirect root to home
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*'],
};
