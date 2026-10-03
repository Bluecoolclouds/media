import PromocodeClient from './PromocodeClient';
import { requireAccountSession } from '../requireAccountSession';

export const metadata = {
  title: 'Promocode — apinet.cloud',
  description: 'Redeem a promo code for bonus credits.',
};

export default async function PromocodePage() {
  await requireAccountSession('/account/promocode');
  return <PromocodeClient />;
}
