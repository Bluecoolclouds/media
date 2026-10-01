'use client';

import { redirect } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }) {
  // TODO: Add actual authentication check
  const isAdmin = true; // Placeholder

  if (!isAdmin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-panel-bg/50 backdrop-blur-xl">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Admin Panel
              </h2>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <AdminNav />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
              <div className="text-xs text-white/40 text-center">
                Open Generative AI v2.0
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-white/10 bg-panel-bg/30 backdrop-blur-xl">
            <div className="h-full px-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-sm text-white/60">Admin Dashboard</h3>
              </div>

              <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <span className="text-xl">🔔</span>
                  <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-semibold">A</span>
                      </div>
                      <span className="text-sm">Admin</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <span>👤</span>
                      <span className="ml-2">Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>⚙️</span>
                      <span className="ml-2">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-400">
                      <span>🚪</span>
                      <span className="ml-2">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
