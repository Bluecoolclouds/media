import SessionsClient from './SessionsClient';
import { requireAccountSession } from '../requireAccountSession';

export const metadata = {
  title: 'All sessions — apinet.cloud',
  description: 'Devices and browsers currently signed in to your account.',
};

export default async function SessionsPage() {
  await requireAccountSession('/account/sessions');
  return <SessionsClient />;
}
