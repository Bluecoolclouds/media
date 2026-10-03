import AccountClient from './AccountClient';
import { requireAccountSession } from './requireAccountSession';

export const metadata = {
  title: 'Manage Account — apinet.cloud',
  description: 'Update your profile, API key and view your balance.',
};

export default async function AccountPage() {
  await requireAccountSession('/account');
  return <AccountClient />;
}
