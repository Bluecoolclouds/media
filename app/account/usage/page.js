import UsageClient from './UsageClient';
import { requireAccountSession } from '../requireAccountSession';

export const metadata = {
  title: 'Usage — apinet.cloud',
  description: 'Track how your credits are spent over time.',
};

export default async function UsagePage() {
  await requireAccountSession('/account/usage');
  return <UsageClient />;
}
