import SubscriptionClient from './SubscriptionClient';
import { requireAccountSession } from '../requireAccountSession';

export const metadata = {
  title: 'Subscription — apinet.cloud',
  description: 'Your current plan and billing status.',
};

export default async function SubscriptionPage() {
  await requireAccountSession('/account/subscription');
  return <SubscriptionClient />;
}
