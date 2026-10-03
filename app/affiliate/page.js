import { redirect } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import AffiliateClient from './AffiliateClient';

export const metadata = {
  title: 'Affiliate Program — apinet.cloud',
  description: 'Share apinet.cloud and earn up to 25% recurring commission for 12 months on every subscription purchased through your affiliate link.',
};

export default async function AffiliatePage() {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent('/affiliate')}`);
  }
  return (
    <SessionProvider session={session}>
      <AffiliateClient />
    </SessionProvider>
  );
}
