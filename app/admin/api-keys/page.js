'use client';

import { useEffect, useState, useCallback } from 'react';
import PageTemplate from '@/components/admin/PageTemplate';
import DataTable from '@/components/admin/DataTable';
import EmptyState from '@/components/admin/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : 'Never');

const columns = [
  { key: 'name', label: 'Name' },
  {
    key: 'user',
    label: 'Owner',
    render: (_, row) => row.user?.email || row.user?.name || 'Unknown',
  },
  {
    key: 'maskedKey',
    label: 'Key',
    render: (value) => <code className="font-mono text-xs text-white/70">{value}</code>,
  },
  {
    key: 'isActive',
    label: 'Status',
    render: (value) => (
      <Badge variant={value ? 'success' : 'destructive'}>{value ? 'Active' : 'Revoked'}</Badge>
    ),
  },
  {
    key: 'createdAt',
    label: 'Created',
    className: 'text-white/60',
    render: (value) => new Date(value).toLocaleDateString(),
  },
  { key: 'lastUsed', label: 'Last used', className: 'text-white/60', render: formatDateTime },
];

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [revoking, setRevoking] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchApiKeys = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      if (status !== 'ALL') params.set('status', status);

      const res = await fetch(`/api/admin/api-keys?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.data || []);
        setPagination(data.pagination || null);
      } else if (res.status === 401 || res.status === 403) {
        toast.error('You do not have access to this resource');
      } else {
        toast.error('Failed to load API keys');
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  async function handleRevoke(apiKey) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/api-keys/${apiKey.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to revoke API key');
        return;
      }
      toast.success(`Revoked "${apiKey.name}"`);
      setRevoking(null);
      fetchApiKeys();
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      toast.error('Failed to revoke API key');
    } finally {
      setSaving(false);
    }
  }

  const tableColumns = [
    ...columns,
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (_, row) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="destructive"
            size="sm"
            disabled={!row.isActive}
            onClick={() => setRevoking(row)}
          >
            Revoke
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTemplate title="API Keys" description="Review and revoke user API keys">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          aria-label="Search by key name or owner email"
          placeholder="Search by name or owner email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(value) => {
            setPage(1);
            setStatus(value);
          }}
        >
          <SelectTrigger className="w-[160px]" aria-label="Filter by status">
            <SelectValue placeholder="All keys" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All keys</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-white/60">
          Loading API keys...
        </div>
      ) : apiKeys.length === 0 ? (
        <EmptyState
          icon={() => <span className="text-4xl">🔑</span>}
          title="No API keys found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <>
          <DataTable columns={tableColumns} data={apiKeys} />
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-white/60">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} keys)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Revoke confirmation dialog */}
      <Dialog open={!!revoking} onOpenChange={(open) => !open && setRevoking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API key</DialogTitle>
            <DialogDescription>
              Revoke &quot;{revoking?.name}&quot; ({revoking?.maskedKey}) owned by{' '}
              {revoking?.user?.email}. Requests using this key will stop working. This cannot be
              undone from the admin panel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevoking(null)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleRevoke(revoking)} disabled={saving}>
              {saving ? 'Revoking...' : 'Revoke'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
