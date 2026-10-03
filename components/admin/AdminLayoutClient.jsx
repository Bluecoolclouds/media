'use client';

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
import { signOut } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

export default function AdminLayoutClient({ children, session }) {
  return (
    <div className="min-h-screen bg-app-bg">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
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
                        <span className="text-primary font-semibold">
                          {session?.user?.name?.[0]?.toUpperCase() || 'A'}
                        </span>
                      </div>
                      <span className="text-sm">{session?.user?.name || 'Admin'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{session?.user?.name || 'Admin'}</span>
                        <span className="text-xs font-normal text-white/60">
                          {session?.user?.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
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
                    <DropdownMenuItem
                      className="text-red-400"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
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
