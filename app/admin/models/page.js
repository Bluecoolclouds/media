'use client';

import { useEffect, useState, useCallback } from 'react';
import PageTemplate from '@/components/admin/PageTemplate';
import DataTable from '@/components/admin/DataTable';
import EmptyState from '@/components/admin/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const MODEL_TYPES = [
  'TEXT_TO_IMAGE',
  'IMAGE_TO_IMAGE',
  'TEXT_TO_VIDEO',
  'IMAGE_TO_VIDEO',
  'AUDIO',
  'LIPSYNC',
  'AVATAR',
  'RECAST',
  'PRODUCT_CARD',
];

const emptyForm = {
  name: '',
  endpoint: '',
  type: 'TEXT_TO_IMAGE',
  category: '',
  provider: '',
  isActive: true,
};

export default function ModelsPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingModel, setDeletingModel] = useState(null);
  const [formError, setFormError] = useState('');

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/models?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setModels(data.data || []);
        setPagination(data.pagination || null);
      } else if (res.status === 401 || res.status === 403) {
        toast.error('You do not have access to this resource');
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      toast.error('Failed to load models');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  async function handleToggleActive(model) {
    try {
      const res = await fetch(`/api/admin/models/${model.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !model.isActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update model');
        return;
      }
      toast.success(`${model.name} is now ${data.isActive ? 'active' : 'inactive'}`);
      fetchModels();
    } catch (error) {
      console.error('Failed to toggle model:', error);
      toast.error('Failed to update model');
    }
  }

  async function handleCreate() {
    setFormError('');
    if (!form.name || !form.endpoint || !form.category || !form.provider) {
      setFormError('All fields are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create model');
        return;
      }
      toast.success(`Model ${data.name} created`);
      setCreateOpen(false);
      setForm(emptyForm);
      setPage(1);
      fetchModels();
    } catch (error) {
      console.error('Failed to create model:', error);
      setFormError('Failed to create model');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(model) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/models/${model.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete model');
        return;
      }
      toast.success(`Deleted ${model.name}`);
      setDeletingModel(null);
      fetchModels();
    } catch (error) {
      console.error('Failed to delete model:', error);
      toast.error('Failed to delete model');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'type',
      label: 'Type',
      render: (value) => <Badge variant="secondary">{value}</Badge>,
    },
    { key: 'provider', label: 'Provider', className: 'text-white/60' },
    { key: 'category', label: 'Category', className: 'text-white/60' },
    {
      key: '_count',
      label: 'Generations',
      render: (value) => value?.generations ?? 0,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value, row) => (
        <Button
          size="sm"
          variant={value ? 'outline' : 'secondary'}
          onClick={() => handleToggleActive(row)}
        >
          {value ? '✅ Active' : '⏸ Inactive'}
        </Button>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (_, row) => (
        <Button variant="destructive" size="sm" onClick={() => setDeletingModel(row)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <PageTemplate
      title="Models"
      description="Manage AI models and configurations"
      actions={
        <Button onClick={() => setCreateOpen(true)}>
          <span className="mr-2">➕</span>
          Add Model
        </Button>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-48 text-white/60">
          Loading models...
        </div>
      ) : models.length === 0 ? (
        <EmptyState
          icon={() => <span className="text-4xl">🤖</span>}
          title="No models yet"
          description="Configure and monitor your AI models here"
          action={<Button onClick={() => setCreateOpen(true)}>Add your first model</Button>}
        />
      ) : (
        <>
          <DataTable columns={columns} data={models} />
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-white/60">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} models)
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

      {/* Create model dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setForm(emptyForm);
            setFormError('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add model</DialogTitle>
            <DialogDescription>
              Register a new AI model available on the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model-name">Name</Label>
              <Input
                id="model-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="FLUX Schnell"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model-endpoint">Endpoint</Label>
              <Input
                id="model-endpoint"
                value={form.endpoint}
                onChange={(e) => setForm((f) => ({ ...f, endpoint: e.target.value }))}
                placeholder="/api/v1/flux-schnell"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model-provider">Provider</Label>
              <Input
                id="model-provider"
                value={form.provider}
                onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
                placeholder="replicate"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model-category">Category</Label>
              <Input
                id="model-category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="image"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) => setForm((f) => ({ ...f, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formError && <p className="text-sm text-red-400">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create model'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingModel} onOpenChange={(open) => !open && setDeletingModel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete model</DialogTitle>
            <DialogDescription>
              This will permanently delete {deletingModel?.name}. Existing generations will also
              be removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingModel(null)} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deletingModel)}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
