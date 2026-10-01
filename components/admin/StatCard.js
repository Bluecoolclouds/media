'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StatCard({ title, value, description, icon: Icon, trend }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/60">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-white/40" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {description && (
          <p className="text-xs text-white/40 mt-1">{description}</p>
        )}
        {trend && (
          <div className={`text-xs mt-2 ${trend.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
