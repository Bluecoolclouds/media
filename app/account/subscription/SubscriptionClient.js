'use client';

import { useRouter } from 'next/navigation';
import AccountShell from '@/components/account/AccountShell';
import { useAccountAuth } from '@/components/account/useAccountAuth';

function CardIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

export default function SubscriptionClient() {
  const router = useRouter();
  const { hasMounted, usd, credits } = useAccountAuth();

  if (!hasMounted) return null;

  return (
    <AccountShell>
      <h1 className="text-xl font-bold tracking-tight">Subscription</h1>
      <p className="mt-1 text-sm text-white/50">Manage your plan, credits, unlimited models</p>

      {/* Plan */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardIcon />
            <span className="text-xs font-medium text-white/50">Subscription</span>
          </div>
          <button
            type="button"
            onClick={() => router.push('/pricing')}
            className="rounded-lg bg-[#22d3ee] px-4 py-1.5 text-xs font-bold text-black hover:bg-[#5eeaff] transition-colors"
          >
            Upgrade plan
          </button>
        </div>

        <p className="mt-3 text-lg font-bold text-white">Free plan</p>
        <p className="text-xs text-white/40">Pay-as-you-go — no recurring billing active.</p>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-xs text-white/60">
          <li className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> Access to the full studio
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> Credits billed per generation
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-white/25">✕</span> Unlimited model access
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-white/25">✕</span> Priority queue
          </li>
        </ul>
      </section>

      {/* Credits */}
      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white/50">Credits</span>
          <button type="button" onClick={() => router.push('/account/usage')} className="text-xs text-cyan-400 hover:text-cyan-300">
            Learn more
          </button>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-white/40">Credits left</p>
            <p className="text-lg font-bold text-white">{credits != null ? credits.toLocaleString() : '—'}</p>
          </div>
          {usd != null && (
            <p className="text-xs text-white/40">${usd} balance</p>
          )}
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#22d3ee] to-[#a855f7]"
            style={{ width: credits != null ? `${Math.min(100, Math.round((credits / 1000000) * 100))}%` : '0%' }}
          />
        </div>
      </section>

      {/* Unlimited models */}
      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm font-semibold text-white">Active unlimited models</p>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-white">0</p>
            <p className="text-[11px] text-white/40">Currently unlimited</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">0</p>
            <p className="text-[11px] text-white/40">Free generations in total</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">+$0</p>
            <p className="text-[11px] text-white/40">Saved in total</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center justify-center rounded-xl bg-black/20 py-8 text-center">
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-white/5 text-xl">📦</div>
          <p className="text-sm font-medium text-white">No unlimited models available</p>
          <p className="mt-1 text-xs text-white/40 max-w-xs">Upgrade to get unlimited models and save money</p>
          <button
            type="button"
            onClick={() => router.push('/pricing')}
            className="mt-3 rounded-lg bg-[#22d3ee] px-4 py-2 text-xs font-bold text-black hover:bg-[#5eeaff] transition-colors"
          >
            Upgrade & Get Unlimited
          </button>
        </div>
      </section>

      {/* Pending invoices */}
      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm font-semibold text-white">Pending invoices</p>
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl bg-black/20 py-8 text-center">
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-white/5 text-xl">🧾</div>
          <p className="text-sm text-white/50">No pending invoices</p>
        </div>
      </section>

      {/* Payment methods */}
      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Payment methods</p>
          <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-white/40">Coming soon</span>
        </div>
        <p className="mt-1 text-xs text-white/40">
          Credit card billing isn't available yet — balance is topped up via your apinet.cloud API key.
        </p>
      </section>

      {/* Billing information */}
      <section className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <p className="text-sm font-semibold text-white">Billing information</p>
          <p className="mt-0.5 text-xs text-white/40">Manage your billing details displayed on your invoices</p>
        </div>
        <button
          type="button"
          disabled
          className="shrink-0 rounded-lg bg-white/5 px-4 py-2 text-xs font-semibold text-white/30 cursor-not-allowed"
        >
          Manage
        </button>
      </section>
    </AccountShell>
  );
}
