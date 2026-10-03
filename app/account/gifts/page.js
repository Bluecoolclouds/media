import GiftsClient from './GiftsClient';
import { requireAccountSession } from '../requireAccountSession';

export const metadata = {
  title: 'Gifts — apinet.cloud',
  description: 'Send and redeem credit gifts with other creators.',
};

export default async function GiftsPage() {
  await requireAccountSession('/account/gifts');
  return <GiftsClient />;
}
