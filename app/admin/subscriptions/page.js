'use client';

import PageTemplate from '@/components/admin/PageTemplate';
import EmptyState from '@/components/admin/EmptyState';

export default function SubscriptionsPage() {
  return (
    <PageTemplate
      title="Subscriptions"
      description="Manage user subscriptions and billing"
    >
      <EmptyState
        icon={() => <span className="text-4xl">💳</span>}
        title="Subscription Management"
        description="Configure subscription plans and monitor billing"
      />
    </PageTemplate>
  );
}
