'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/admin/StatCard';
import DataTable from '@/components/admin/DataTable';
import PageTemplate from '@/components/admin/PageTemplate';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// recharts measures the DOM, so load it client-side only and keep it out of the initial bundle.
const GenerationsChart = dynamic(() => import('./_components/GenerationsChart'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-white/[0.03]" />,
});

const columns = [
  { key: 'user', label: 'User', render: (_, row) => row.user?.email || 'Unknown' },
  { key: 'model', label: 'Model', render: (_, row) => row.model?.name || 'Unknown' },
  { key: 'type', label: 'Type', render: (_, row) => row.model?.type || '-' },
  {
    key: 'status',
    label: 'Status',
    render: (value) => {
      const variants = {
        COMPLETED: 'success',
        PROCESSING: 'default',
        PENDING: 'default',
        FAILED: 'destructive',
      };
      return <Badge variant={variants[value] || 'default'}>{value}</Badge>;
    },
  },
  {
    key: 'createdAt',
    label: 'Time',
    className: 'text-white/60',
    render: (value) => new Date(value).toLocaleString()
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGenerations: 0,
    activeModels: 0,
    revenue: '$0',
  });
  const daily = stats.generations?.daily || [];
  const [recentGenerations, setRecentGenerations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stats
        const statsRes = await fetch('/api/admin/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch recent generations
        const genRes = await fetch('/api/admin/generations?limit=5');
        if (genRes.ok) {
          const genData = await genRes.json();
          setRecentGenerations(genData.generations || []);
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <PageTemplate title="Dashboard" description="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-white/60">Loading dashboard data...</div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Dashboard"
      description="Overview of your generative AI platform"
      actions={
        <>
          <Button variant="outline">
            <span className="mr-2">📊</span>
            Export Report
          </Button>
          <Button>
            <span className="mr-2">➕</span>
            Add Model
          </Button>
        </>
      }
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          description="+12% from last month"
          icon={() => <span className="text-xl">👥</span>}
          trend={{ direction: 'up', value: '12%' }}
        />
        <StatCard
          title="Total Generations"
          value={stats.totalGenerations.toLocaleString()}
          description="+24% from last month"
          icon={() => <span className="text-xl">🎨</span>}
          trend={{ direction: 'up', value: '24%' }}
        />
        <StatCard
          title="Active Models"
          value={stats.activeModels}
          description="3 newly integrated"
          icon={() => <span className="text-xl">🤖</span>}
        />
        <StatCard
          title="Revenue"
          value={stats.revenue}
          description="+8% from last month"
          icon={() => <span className="text-xl">💰</span>}
          trend={{ direction: 'up', value: '8%' }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Generations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Generations</span>
              <Button variant="ghost" size="sm">
                View All →
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentGenerations.length > 0 ? (
              <DataTable columns={columns} data={recentGenerations} />
            ) : (
              <div className="text-center py-8 text-white/40">
                No generations yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generation Trends: generations per day, last 30 days */}
        <Card>
          <CardHeader>
            <CardTitle>Generation Trends (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {daily.some((d) => d.count > 0) ? (
              <GenerationsChart data={daily} />
            ) : (
              <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-lg text-white/40 text-sm">
                No generations in the last 30 days
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <span className="text-2xl">👥</span>
              <span className="text-sm">Manage Users</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <span className="text-2xl">🤖</span>
              <span className="text-sm">Configure Models</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <span className="text-2xl">🔑</span>
              <span className="text-sm">API Keys</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <span className="text-2xl">⚙️</span>
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
