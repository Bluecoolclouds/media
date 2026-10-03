import { redirect } from 'next/navigation';
import { auth } from '@/auth';

/**
 * Server-side gate for /account/* pages: unauthenticated visitors are sent to
 * /login with a callbackUrl back to the page they asked for.
 */
export async function requireAccountSession(path) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(path)}`);
  }
  return session;
}
