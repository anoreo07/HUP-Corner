import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect root to trang-chu
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/trang-chu', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
