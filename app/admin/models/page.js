'use client';

import PageTemplate from '@/components/admin/PageTemplate';
import EmptyState from '@/components/admin/EmptyState';
import { Button } from '@/components/ui/button';

export default function ModelsPage() {
  return (
    <PageTemplate
      title="Models"
      description="Manage AI models and configurations"
      actions={
        <Button>
          <span className="mr-2">➕</span>
          Add Model
        </Button>
      }
    >
      <EmptyState
        icon={() => <span className="text-4xl">🤖</span>}
        title="Model Management"
        description="Configure and monitor your AI models here"
        action={<Button variant="outline">Configure Models</Button>}
      />
    </PageTemplate>
  );
}
