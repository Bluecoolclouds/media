'use client';

import AccountShell from '@/components/account/AccountShell';

function TagIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.17L3.83 9.59A2 2 0 0 0 3.17 11l9.58 9.59a2 2 0 0 0 2.83 0l5.17-5.17a2 2 0 0 0-.16-2.01z" />
      <circle cx="8" cy="8" r="1.5" />
    </svg>
  );
}

// Redemption is disabled until a /api/promocode/redeem endpoint exists.
// The tab is greyed out in AccountShell; this covers direct navigation.
export default function PromocodeClient() {
  return (
    <AccountShell>
      <h1 className="text-xl font-bold tracking-tight">Promocode</h1>
      <p className="mt-1 text-sm text-white/50">Redeem a promo code for bonus credits.</p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 max-w-md">
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/30">
          <TagIcon />
        </div>

        <fieldset disabled className="flex flex-col gap-3">
          <label htmlFor="promo-code" className="text-xs font-medium text-white/30">Enter your code</label>
          <input
            id="promo-code"
            type="text"
            placeholder="e.g. WELCOME100"
            className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-sm text-white/30 placeholder:text-white/20 cursor-not-allowed"
          />
          <button
            type="button"
            className="mt-1 w-full rounded-lg bg-white/10 py-2.5 text-sm font-bold text-white/30 cursor-not-allowed"
          >
            Redeem code
          </button>
        </fieldset>

        <p className="mt-4 text-sm text-white/40">
          Promo code redemption isn&apos;t available yet.
        </p>
      </div>
    </AccountShell>
  );
}
