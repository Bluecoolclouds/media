import { NextResponse } from 'next/server';
import { getCurrentUser } from './auth';

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
      user: null,
    };
  }

  if (user.role !== 'ADMIN') {
    return {
      error: NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}
