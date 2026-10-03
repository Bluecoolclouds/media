import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST only: a GET handler let any page (<img src="/api/clear-cookies">)
// log users out cross-site. Nothing in the app currently calls this route.
export async function POST() {
  const cookieStore = await cookies();

  // Delete all auth cookies
  cookieStore.delete('authjs.session-token');
  cookieStore.delete('__Secure-authjs.session-token');
  cookieStore.delete('next-auth.session-token');
  cookieStore.delete('__Secure-next-auth.session-token');

  return NextResponse.json({
    success: true,
    message: 'All cookies cleared. Please login again.'
  });
}
