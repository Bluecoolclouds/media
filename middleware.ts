import { auth } from './auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Protect admin routes
  if (nextUrl.pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', nextUrl.origin);
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has admin role
    const userRole = req.auth?.user?.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
