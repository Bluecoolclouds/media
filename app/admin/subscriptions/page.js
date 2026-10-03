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
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'CANCELLED', 'EXPIRED'];
const PLAN_OPTIONS = ['ALL', 'FREE', 'PRO', 'ENTERPRISE'];

const statusVariants = {
  ACTIVE: 'success',
  CANCELLED: 'destructive',
  EXPIRED: 'secondary',
};

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-');

const columns = [
  { key: 'user', label: 'User', render: (_, row) => row.user?.email || 'Unknown' },
  {
    key: 'plan',
    label: 'Plan',
    render: (value) => <Badge variant={value === 'FREE' ? 'secondary' : 'default'}>{value}</Badge>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (value, row) => (
      <div className="flex items-center gap-2">
        <Badge variant={statusVariants[value] || 'default'}>{value}</Badge>
        {row.cancelAtPeriodEnd && <span className="text-xs text-white/40">cancels at period end</span>}
      </div>
    ),
  },
  { key: 'currentPeriodStart', label: 'Period start', className: 'text-white/60', render: formatDate },
  { key: 'currentPeriodEnd', label: 'Period end', className: 'text-white/60', render: formatDate },
  { key: 'createdAt', label: 'Created', className: 'text-white/60', render: formatDate },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [plan, setPlan] = useState('ALL');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [cancelling, setCancelling] = useState(null);
  const [extending, setExtending] = useState(null);
  const [extendDays, setExtendDays] = useState('30');
  const [saving, setSaving] = useState(false);

  // Debounce the email search so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      if (status !== 'ALL') params.set('status', status);
      if (plan !== 'ALL') params.set('plan', plan);

      const res = await fetch(`/api/admin/subscriptions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.data || []);
        setPagination(data.pagination || null);
      } else if (res.status === 401 || res.status === 403) {
        toast.error('You do not have access to this resource');
      } else {
        toast.error('Failed to load subscriptions');
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, plan]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  async function patchSubscription(subscription, body, successMessage) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${subscription.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update subscription');
        return false;
      }
      toast.success(successMessage);
      fetchSubscriptions();
      return true;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      toast.error('Failed to update subscription');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    const ok = await patchSubscription(
      cancelling,
      { action: 'cancel' },
      `Cancelled subscription for ${cancelling.user?.email || 'user'}`
    );
    if (ok) setCancelling(null);
  }

  async function handleExtend() {
    const days = Number(extendDays);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      toast.error('Days must be a whole number between 1 and 365');
      return;
    }
    const ok = await patchSubscription(
      extending,
      { action: 'extend', days },
      `Extended subscription for ${extending.user?.email || 'user'} by ${days} days`
    );
    if (ok) setExtending(null);
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
            variant="outline"
            size="sm"
            onClick={() => {
              setExtendDays('30');
              setExtending(row);
            }}
          >
            Extend
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={row.status === 'CANCELLED'}
            onClick={() => setCancelling(row)}
          >
            Cancel
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTemplate title="Subscriptions" description="Manage user subscriptions and billing">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          aria-label="Search by user email"
          placeholder="Search by user email..."
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
        <Select
          value={plan}
          onValueChange={(value) => {
            setPage(1);
            setPlan(value);
          }}
        >
          <SelectTrigger className="w-[160px]" aria-label="Filter by plan">
            <SelectValue placeholder="All plans" />
          </SelectTrigger>
          <SelectContent>
            {PLAN_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === 'ALL' ? 'All plans' : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-white/60">
          Loading subscriptions...
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          icon={() => <span className="text-4xl">💳</span>}
          title="No subscriptions found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <>
          <DataTable columns={tableColumns} data={subscriptions} />
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-white/60">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} subscriptions)
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

      {/* Extend dialog */}
      <Dialog open={!!extending} onOpenChange={(open) => !open && setExtending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend subscription</DialogTitle>
            <DialogDescription>
              Extend the {extending?.plan} subscription for {extending?.user?.email}. Days are added
              to the current period end, or to today if it has already passed. The subscription is
              set to ACTIVE.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="extend-days">Days</Label>
            <Input
              id="extend-days"
              type="number"
              min={1}
              max={365}
              value={extendDays}
              onChange={(e) => setExtendDays(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtending(null)} disabled={saving}>
              Close
            </Button>
            <Button onClick={handleExtend} disabled={saving}>
              {saving ? 'Saving...' : 'Extend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation dialog */}
      <Dialog open={!!cancelling} onOpenChange={(open) => !open && setCancelling(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel subscription</DialogTitle>
            <DialogDescription>
              This will immediately cancel the {cancelling?.plan} subscription for{' '}
              {cancelling?.user?.email}. You can reactivate it later with Extend.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelling(null)} disabled={saving}>
              Keep subscription
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={saving}>
              {saving ? 'Cancelling...' : 'Cancel subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
