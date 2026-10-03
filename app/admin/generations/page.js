'use client';

import { useEffect, useState, useCallback } from 'react';
import PageTemplate from '@/components/admin/PageTemplate';
import DataTable from '@/components/admin/DataTable';
import EmptyState from '@/components/admin/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];

const statusVariants = {
  COMPLETED: 'success',
  PROCESSING: 'default',
  PENDING: 'secondary',
  FAILED: 'destructive',
};

const columns = [
  { key: 'user', label: 'User', render: (_, row) => row.user?.email || 'Unknown' },
  { key: 'model', label: 'Model', render: (_, row) => row.model?.name || 'Unknown' },
  { key: 'type', label: 'Type', render: (_, row) => row.model?.type || '-' },
  {
    key: 'prompt',
    label: 'Prompt',
    className: 'max-w-xs truncate text-white/60',
    render: (value) => value || '-',
  },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <Badge variant={statusVariants[value] || 'default'}>{value}</Badge>,
  },
  {
    key: 'cost',
    label: 'Cost',
    render: (value) => (value != null ? `$${Number(value).toFixed(3)}` : '-'),
  },
  {
    key: 'createdAt',
    label: 'Time',
    className: 'text-white/60',
    render: (value) => new Date(value).toLocaleString(),
  },
];

export default function GenerationsPage() {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const fetchGenerations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (status !== 'ALL') params.set('status', status);

      const res = await fetch(`/api/admin/generations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setGenerations(data.data || []);
        setPagination(data.pagination || null);
      } else if (res.status === 401 || res.status === 403) {
        toast.error('You do not have access to this resource');
      }
    } catch (error) {
      console.error('Failed to fetch generations:', error);
      toast.error('Failed to load generations');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  function handleExport() {
    const headers = ['id', 'user', 'model', 'status', 'cost', 'createdAt'];
    const rows = generations.map((g) => [
      g.id,
      g.user?.email || '',
      g.model?.name || '',
      g.status,
      g.cost ?? '',
      g.createdAt,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generations-page-${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PageTemplate
      title="Generations"
      description="View all AI generations across the platform"
      actions={
        <Button variant="outline" onClick={handleExport} disabled={generations.length === 0}>
          <span className="mr-2">📊</span>
          Export Data
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Select
          value={status}
          onValueChange={(value) => {
            setPage(1);
            setStatus(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === 'ALL' ? 'All statuses' : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-white/60">
          Loading generations...
        </div>
      ) : generations.length === 0 ? (
        <EmptyState
          icon={() => <span className="text-4xl">🎨</span>}
          title="No generations found"
          description="Try adjusting your filters, or check back once users start generating"
        />
      ) : (
        <>
          <DataTable columns={columns} data={generations} />
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-white/60">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total}{' '}
                generations)
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
    </PageTemplate>
  );
}
