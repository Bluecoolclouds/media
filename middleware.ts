import { auth } from './auth';
import { NextResponse } from 'next/server';

export default auth(() => {
  // Admin routes render their own sign-in form and access-denied screen
  // in app/admin/layout.js, so middleware does not redirect them away.
  // The layout re-checks the session and role server-side before rendering
  // any admin content, so this is not a security gap. API routes under
  // /api/admin/* also enforce their own requireAdmin() check independently.

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
