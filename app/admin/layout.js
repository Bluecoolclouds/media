import { auth } from '@/auth';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import AdminLoginGate from '@/components/admin/AdminLoginGate';
import AdminAccessDenied from '@/components/admin/AdminAccessDenied';

export default async function AdminLayout({ children }) {
  const session = await auth();

  // Not logged in: show the sign-in form right here, no redirect.
  if (!session?.user) {
    return <AdminLoginGate />;
  }

  // Logged in but not an admin: explain why, don't silently bounce to "/".
  if (session.user.role !== 'ADMIN') {
    return <AdminAccessDenied email={session.user.email} />;
  }

  return (
    <AdminLayoutClient session={session}>
      {children}
    </AdminLayoutClient>
  );
}
