import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Profile — apinet.cloud',
  description: 'View your profile and balance.',
};

export default function ProfilePage() {
  redirect('/account');
}
