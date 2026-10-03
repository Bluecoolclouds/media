'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function initials(name, email) {
  if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  if (email) return email[0].toUpperCase();
  return 'U';
}

export default function ProfilePageClient({ user, generations }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const stats = {
    total: generations.length,
    completed: generations.filter(g => g.status === 'COMPLETED').length,
    pending: generations.filter(g => g.status === 'PENDING' || g.status === 'PROCESSING').length,
    failed: generations.filter(g => g.status === 'FAILED').length,
  };

  const filteredGenerations = activeTab === 'all'
    ? generations
    : generations.filter(g => g.model.type === activeTab);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <BackIcon />
            Back to home
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="size-20 rounded-full bg-gradient-to-br from-[#22d3ee] to-[#a855f7] flex items-center justify-center text-black text-3xl font-black shrink-0">
              {initials(user.name, user.email)}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user.name || user.email.split('@')[0]}</h1>
              <p className="text-sm text-white/50 mt-1">@{user.email.split('@')[0]}</p>
              <p className="text-xs text-white/40 mt-0.5">{user.email}</p>
              {user.role === 'ADMIN' && (
                <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                  Admin
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/settings')}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors border border-white/10"
            >
              Settings
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors border border-red-500/20"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-white/50 mt-1">Total works</div>
          </div>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-xs text-white/50 mt-1">Completed</div>
          </div>
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-xs text-white/50 mt-1">Processing</div>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
            <div className="text-xs text-white/50 mt-1">Failed</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All works' },
            { key: 'TEXT_TO_IMAGE', label: 'Images' },
            { key: 'TEXT_TO_VIDEO', label: 'Videos' },
            { key: 'AUDIO', label: 'Audio' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Generations Grid */}
        {filteredGenerations.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">No generations yet</h3>
            <p className="text-white/50 text-sm mb-6">
              {activeTab === 'all'
                ? 'Start creating to see your work here'
                : `No ${activeTab.toLowerCase().replace('_', ' ')} generations yet`
              }
            </p>
            <button
              onClick={() => router.push('/studio')}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Start creating
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGenerations.map(gen => (
              <div
                key={gen.id}
                className="group rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-white/20 transition-all cursor-pointer"
                onClick={() => {
                  // TODO: Open generation detail modal
                }}
              >
                <div className="aspect-square bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center relative overflow-hidden">
                  {gen.resultUrl ? (
                    <img
                      src={gen.resultUrl}
                      alt={gen.prompt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl">
                      {gen.model.type === 'TEXT_TO_IMAGE' || gen.model.type === 'IMAGE_TO_IMAGE' ? '🖼️' :
                       gen.model.type === 'TEXT_TO_VIDEO' || gen.model.type === 'IMAGE_TO_VIDEO' ? '🎬' :
                       gen.model.type === 'AUDIO' ? '🎵' : '✨'}
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      gen.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                      gen.status === 'PROCESSING' || gen.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {gen.status}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-white/70 font-medium mb-1">{gen.model.name}</p>
                  <p className="text-xs text-white/50 line-clamp-2">{gen.prompt}</p>
                  <p className="text-xs text-white/30 mt-2">
                    {new Date(gen.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
