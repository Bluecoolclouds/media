'use client';

import AccountShell from '@/components/account/AccountShell';

const GIFT_CARDS = [
  { credits: 250000, usd: 5, gradient: 'from-[#22d3ee] to-[#0ea5e9]' },
  { credits: 500000, usd: 10, gradient: 'from-[#a855f7] to-[#6366f1]' },
  { credits: 1250000, usd: 25, gradient: 'from-[#f59e0b] to-[#ef4444]' },
];

function GiftCard({ credits, usd, gradient }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex flex-col">
      <div className={`h-28 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-black font-black text-lg relative overflow-hidden`}>
        <span className="relative z-10">${usd} Gift card</span>
        <svg className="absolute -right-4 -bottom-4 size-24 opacity-20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="8" width="18" height="13" rx="1" />
          <path d="M12 8v13M3 12h18" />
        </svg>
      </div>
      <p className="mt-4 text-sm font-semibold text-white">{credits.toLocaleString()} credits</p>
      <p className="mt-1 text-xs text-white/40">Delivered instantly to the recipient's account.</p>
      <button
        type="button"
        disabled
        className="mt-4 w-full py-2.5 rounded-lg bg-white/10 text-white/40 text-sm font-semibold cursor-not-allowed"
        title="Gifting isn't available yet"
      >
        Buy & send gift
      </button>
    </div>
  );
}

export default function GiftsClient() {
  return (
    <AccountShell>
      <h1 className="text-xl font-bold tracking-tight">Gift cards</h1>
      <p className="mt-1 text-sm text-white/50">Wrap up creativity and gift it to your friend</p>

      <div className="mt-6 rounded-xl border border-[#22d3ee]/20 bg-[#22d3ee]/5 px-4 py-3 flex items-center justify-between gap-4">
        <p className="text-xs text-white/60">
          Gift cards aren't purchasable yet — here's a preview of what's coming.
        </p>
        <span className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-white/40">Coming soon</span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GIFT_CARDS.map((card) => (
          <GiftCard key={card.usd} {...card} />
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm font-semibold text-white">Have a gift code?</p>
        <p className="mt-1 text-xs text-white/40">Code redemption is coming soon.</p>
        <button
          type="button"
          disabled
          title="Promo code redemption isn't available yet"
          className="mt-3 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white/40 cursor-not-allowed"
        >
          Go to Promocode
        </button>
      </div>
    </AccountShell>
  );
}
