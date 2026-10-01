'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/admin/StatCard';
import DataTable from '@/components/admin/DataTable';
import PageTemplate from '@/components/admin/PageTemplate';
import { Button } from '@/components/ui/button';

// Mock data - replace with real API calls
const stats = {
  totalUsers: 1247,
  totalGenerations: 15678,
  activeModels: 12,
  revenue: '$4,823',
};

const recentGenerations = [
  {
    id: '1',
    user: 'john@example.com',
    model: 'DALL-E 3',
    type: 'Image',
    status: 'completed',
    timestamp: '2 mins ago',
  },
  {
    id: '2',
    user: 'sarah@example.com',
    model: 'Stable Diffusion',
    type: 'Image',
    status: 'completed',
    timestamp: '5 mins ago',
  },
  {
    id: '3',
    user: 'mike@example.com',
    model: 'Runway Gen-2',
    type: 'Video',
    status: 'processing',
    timestamp: '8 mins ago',
  },
  {
    id: '4',
    user: 'emma@example.com',
    model: 'Midjourney',
    type: 'Image',
    status: 'completed',
    timestamp: '12 mins ago',
  },
  {
    id: '5',
    user: 'alex@example.com',
    model: 'DALL-E 3',
    type: 'Image',
    status: 'failed',
    timestamp: '15 mins ago',
  },
];

const columns = [
  { key: 'user', label: 'User' },
  { key: 'model', label: 'Model' },
  { key: 'type', label: 'Type' },
  {
    key: 'status',
    label: 'Status',
    render: (value) => {
      const variants = {
        completed: 'success',
        processing: 'default',
        failed: 'destructive',
      };
      return <Badge variant={variants[value]}>{value}</Badge>;
    },
  },
  { key: 'timestamp', label: 'Time', className: 'text-white/60' },
];

export default function AdminDashboard() {
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
            <DataTable columns={columns} data={recentGenerations} />
          </CardContent>
        </Card>

        {/* Generation Trends Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Generation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-lg">
              <div className="text-center">
                <span className="text-4xl mb-2 block">📈</span>
                <p className="text-white/40 text-sm">Chart placeholder</p>
                <p className="text-white/20 text-xs mt-1">
                  Integration with recharts coming soon
                </p>
              </div>
            </div>
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
