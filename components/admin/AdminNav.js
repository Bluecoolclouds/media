'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/models', label: 'Models', icon: '🤖' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/generations', label: 'Generations', icon: '🎨' },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: '💳' },
  { href: '/admin/api-keys', label: 'API Keys', icon: '🔑' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/admin/logs', label: 'Logs', icon: '📝' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
