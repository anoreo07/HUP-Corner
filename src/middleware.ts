import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes server-side
  if (pathname.startsWith('/admin')) {
    // Allow the admin login page and any public admin assets through
    if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
      return NextResponse.next();
    }

    const token = await getToken({ req: request, secret: NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'admin') {
      // API callers should receive 401
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // For pages, redirect to admin login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Redirect root to trang-chu
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/trang-chu', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*'],
};
