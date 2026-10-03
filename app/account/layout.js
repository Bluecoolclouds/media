import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';

// Provides the NextAuth session to every /account/* client component.
// The per-page redirect (requireAccountSession) is what actually gates access.
export default async function AccountLayout({ children }) {
  const session = await auth();
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
