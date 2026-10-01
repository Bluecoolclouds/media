'use client';

import PageTemplate from '@/components/admin/PageTemplate';
import EmptyState from '@/components/admin/EmptyState';
import { Button } from '@/components/ui/button';

export default function UsersPage() {
  return (
    <PageTemplate
      title="Users"
      description="Manage user accounts and permissions"
      actions={
        <Button>
          <span className="mr-2">➕</span>
          Add User
        </Button>
      }
    >
      <EmptyState
        icon={() => <span className="text-4xl">👥</span>}
        title="User Management"
        description="View and manage all user accounts"
        action={<Button variant="outline">View All Users</Button>}
      />
    </PageTemplate>
  );
}
