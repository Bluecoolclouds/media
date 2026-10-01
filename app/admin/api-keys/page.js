'use client';

import PageTemplate from '@/components/admin/PageTemplate';
import EmptyState from '@/components/admin/EmptyState';
import { Button } from '@/components/ui/button';

export default function ApiKeysPage() {
  return (
    <PageTemplate
      title="API Keys"
      description="Manage API keys and access tokens"
      actions={
        <Button>
          <span className="mr-2">➕</span>
          Generate Key
        </Button>
      }
    >
      <EmptyState
        icon={() => <span className="text-4xl">🔑</span>}
        title="API Key Management"
        description="Create and manage API keys for platform access"
        action={<Button variant="outline">View Documentation</Button>}
      />
    </PageTemplate>
  );
}
