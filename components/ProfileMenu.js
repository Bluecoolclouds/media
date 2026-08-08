'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Balance comes from apinet as credits; 1 USD = 500,000 credits.
const CREDITS_PER_USD = 500000;

function initials(email) {
  if (!email) return 'U';
  return email.trim()[0].toUpperCase();
}

export default function ProfileMenu({ email, balance, plan = 'Free Plan', onSignOut, onUpgrade }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  const usd = balance != null ? balance : null;
  const credits = usd != null ? Math.round(usd * CREDITS_PER_USD) : null;
  const username = email ? email.split('@')[0] : 'Guest';

  return (
    <div className="relative" ref={ref}>
      {/* Trigger avatar */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="size-8 rounded-full bg-gradient-to-br from-[#22d3ee] to-[#a855f7] flex items-center justify-center text-black text-xs font-black border border-white/10 hover:scale-105 transition-transform"
        title={username}
      >
        {initials(email)}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-[3001] w-72 rounded-[20px] bg-[#0f0f0f] border border-white/10 shadow-2xl p-1.5 animate-scale-up origin-top-right">
          {/* User header */}
          <div className="flex items-center gap-2.5 px-2 pt-2 pb-1">
            <div className="size-8 rounded-full bg-gradient-to-br from-[#22d3ee] to-[#a855f7] flex items-center justify-center text-black text-xs font-black shrink-0">
              {initials(email)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">{username}</p>
              <p className="truncate text-xs font-medium text-white/40">{plan}</p>
            </div>
          </div>

          {/* Credits card */}
          <div className="py-1.5">
            <div className="flex flex-col gap-1 rounded-2xl bg-white/[0.04] px-3 pt-2.5 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white">Balance</span>
                <span className="text-xs font-medium text-white/50">
                  {usd != null ? `$${usd}` : '—'}
                </span>
              </div>
              {credits != null && (
                <p className="text-[10px] text-white/30">{credits.toLocaleString()} credits</p>
              )}
              <button
                type="button"
                onClick={() => { setOpen(false); onUpgrade?.(); }}
                className="mt-1.5 flex h-8 w-full items-center justify-between rounded-full px-1 text-xs font-medium text-white transition-colors hover:bg-white/5"
              >
                <span className="flex items-center gap-1.5">
                  <span className="flex size-6 items-center justify-center text-[#22d3ee]">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none">
                      <path d="M12.6278 3.33956C12.4892 3.12769 12.2532 3 12 3C11.7469 3 11.5108 3.12769 11.3723 3.33956L7.51232 9.24306L2.12793 6.10217C1.87239 5.9531 1.55311 5.96818 1.31275 6.14067C1.0724 6.31315 0.955898 6.61081 1.01531 6.90062L3.41398 18.6014C3.58087 19.4155 4.29729 20 5.12833 20H18.8717C19.7028 20 20.4192 19.4155 20.5861 18.6014L22.9848 6.90062C23.0442 6.61081 22.9277 6.31315 22.6873 6.14067C22.447 5.96818 22.1277 5.9531 21.8721 6.10217L16.4877 9.24306L12.6278 3.33956Z" fill="currentColor" />
                    </svg>
                  </span>
                  Go Premium
                </span>
                <span className="flex h-6 items-center rounded-full bg-[#22d3ee] px-3 text-[10px] font-semibold text-black">
                  Upgrade
                </span>
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="pb-1">
            <button
              type="button"
              onClick={() => { setOpen(false); router.push('/pricing'); }}
              className="flex h-8 w-full items-center gap-1.5 rounded-full pl-1 pr-2.5 text-left text-xs font-medium text-white transition-colors hover:bg-white/5"
            >
              <span className="flex size-6 items-center justify-center text-white/40">
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C9.51472 2 7.5 4.01472 7.5 6.5C7.5 8.98528 9.51472 11 12 11C14.4853 11 16.5 8.98528 16.5 6.5C16.5 4.01472 14.4853 2 12 2Z" />
                  <path d="M12.0004 12.5C7.8271 12.5 4.77345 15.2936 3.9402 19.0013C3.69057 20.112 4.60014 21 5.59882 21H18.402C19.4007 21 20.3102 20.112 20.0606 19.0013C19.2274 15.2936 16.1737 12.5 12.0004 12.5Z" />
                </svg>
              </span>
              Pricing & plans
            </button>
          </div>

          <div className="h-px w-full bg-white/10" />

          {/* Sign out */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => { setOpen(false); onSignOut?.(); }}
              className="flex h-8 w-full items-center gap-1.5 rounded-full pl-1 pr-2.5 text-left text-xs font-medium text-white transition-colors hover:bg-white/5"
            >
              <span className="flex size-6 items-center justify-center text-white/40">
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M4.75 4.5C4.61193 4.5 4.5 4.61193 4.5 4.75L4.5 19.25C4.5 19.3881 4.61193 19.5 4.75 19.5H11.25C11.6642 19.5 12 19.8358 12 20.25C12 20.6642 11.6642 21 11.25 21H4.75C3.7835 21 3 20.2165 3 19.25L3 4.75C3 3.7835 3.7835 3 4.75 3L11.25 3C11.6642 3 12 3.33579 12 3.75C12 4.16421 11.6642 4.5 11.25 4.5L4.75 4.5ZM15.2197 6.96967C15.5126 6.67678 15.9874 6.67678 16.2803 6.96967L20.7803 11.4697C21.0732 11.7626 21.0732 12.2374 20.7803 12.5303L16.2803 17.0303C15.9874 17.3232 15.5126 17.3232 15.2197 17.0303C14.9268 16.7374 14.9268 16.2626 15.2197 15.9697L18.4393 12.75L9 12.75C8.58579 12.75 8.25 12.4142 8.25 12C8.25 11.5858 8.58579 11.25 9 11.25L18.4393 11.25L15.2197 8.03033C14.9268 7.73744 14.9268 7.26256 15.2197 6.96967Z" fill="currentColor" />
                </svg>
              </span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
