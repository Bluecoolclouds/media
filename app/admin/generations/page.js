'use client';

import PageTemplate from '@/components/admin/PageTemplate';
import EmptyState from '@/components/admin/EmptyState';
import { Button } from '@/components/ui/button';

export default function GenerationsPage() {
  return (
    <PageTemplate
      title="Generations"
      description="View all AI generations across the platform"
      actions={
        <Button variant="outline">
          <span className="mr-2">📊</span>
          Export Data
        </Button>
      }
    >
      <EmptyState
        icon={() => <span className="text-4xl">🎨</span>}
        title="Generation History"
        description="Monitor all AI generations in one place"
      />
    </PageTemplate>
  );
}
