'use client';

import { useMemo, useState } from 'react';
import AccountShell from '@/components/account/AccountShell';
import { CREDITS_PER_USD } from '@/components/account/useLocalAuth';
import { useAccountAuth } from '@/components/account/useAccountAuth';

function RefreshIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6M3 22v-6h6" />
      <path d="M21 8a9 9 0 0 0-15-6.7L3 4M3 16a9 9 0 0 0 15 6.7L21 20" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 15l4-5 3 3 5-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <span className="text-white/40">{icon}</span>
      <div>
        <p className="text-lg font-bold text-white leading-none">{value}</p>
        <p className="mt-1 text-[11px] text-white/40">{label}</p>
      </div>
    </div>
  );
}

const RANGE_OPTIONS = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'all', label: 'All time' },
];

export default function UsageClient() {
  const { hasMounted, credits } = useAccountAuth();
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [range, setRange] = useState('7d');
  const [rangeMenuOpen, setRangeMenuOpen] = useState(false);

  // The upstream billing API only exposes current balance today, not a
  // per-event ledger, so there is no history to show until a real usage-log
  // endpoint ships server-side. (Previously faked from a localStorage
  // sign-in timestamp, which is no longer an identity source.)
  const history = useMemo(() => [], []);

  if (!hasMounted) return null;

  const rangeLabel = RANGE_OPTIONS.find((r) => r.id === range)?.label || 'Last 7 days';

  return (
    <AccountShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Usage history</h1>
          <p className="mt-1 text-sm text-white/50">View credits usage, history and statistics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/[0.06] transition-colors"
          >
            <RefreshIcon /> Refresh
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setRangeMenuOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/[0.06] transition-colors"
            >
              <CalendarIcon /> {rangeLabel}
            </button>
            {rangeMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-white/10 bg-[#0d0d0d] p-1 shadow-xl z-20">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { setRange(opt.id); setRangeMenuOpen(false); }}
                    className={`w-full rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                      opt.id === range ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {noticeOpen && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <span className="mt-0.5 text-white/50">ℹ️</span>
          <div className="flex-1">
            <p className="text-sm text-white/80">You can see your credit usage history starting from October 1, 2026.</p>
            <p className="mt-1 text-xs text-white/40">Some earlier data isn&apos;t available due to system limitations — thanks for your understanding.</p>
          </div>
          <button type="button" onClick={() => setNoticeOpen(false)} className="text-white/40 hover:text-white transition-colors">
            <CloseIcon />
          </button>
        </div>
      )}

      {/* Spend overview */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-white/80">
            <ChartIcon /> Spend overview
          </span>
          <button type="button" className="text-xs font-medium text-[#22d3ee] hover:underline">Learn more</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon="💲" label="Total cost" value="€0" />
          <StatCard icon="🪙" label="Credits spent" value="0" />
          <StatCard icon="🧩" label="Features used" value="0" />
          <StatCard icon="⚡" label="Total generations" value="0" />
        </div>

        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-white/5 bg-black/20 py-10 text-center">
          <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-white/5 text-lg">🪣</div>
          <p className="text-sm font-semibold text-white/70">No spend data yet</p>
          <p className="mt-1 text-xs text-white/40 max-w-xs">Feature usage will appear here once you start spending credits.</p>
        </div>
      </section>

      {/* Usage history table */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-white/80 mb-4">
          <ChartIcon /> Usage history
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-white/35">
                <th className="pb-3 font-medium">Credits</th>
                <th className="pb-3 font-medium">All features</th>
                <th className="pb-3 font-medium">All actions</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-white/40">
                    No usage history yet
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.id} className="border-t border-white/5">
                    <td className="py-3 font-semibold text-[#4ade80]">+{row.delta} credits</td>
                    <td className="py-3 text-white/80">{row.feature}</td>
                    <td className="py-3 text-white/60">{row.action}</td>
                    <td className="py-3 text-white/40">
                      {row.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                      {row.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-white/40">
            Show
            <select className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-white/70 text-xs">
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span>Page 1 of 1</span>
            <div className="flex items-center gap-1">
              <button type="button" disabled className="rounded-md border border-white/10 p-1 opacity-40">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button type="button" disabled className="rounded-md border border-white/10 p-1 opacity-40">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {credits != null && (
        <p className="mt-4 text-xs text-white/30">Current balance: {credits.toLocaleString()} credits (1 credit = ${(1 / CREDITS_PER_USD).toFixed(6)})</p>
      )}
    </AccountShell>
  );
}
