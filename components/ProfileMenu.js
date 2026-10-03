'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from 'studio/src/i18n/useLang';
import { setLang as setAppLang, LANG_CYCLE, LANG_LABEL } from 'studio/src/i18n/core';

// Balance comes from apinet as credits; 1 USD = 500,000 credits.
const CREDITS_PER_USD = 500000;
// Visual cap for the credits progress bar (purely decorative, like the
// reference design's dot/segment indicator) — not a real plan limit.
const CREDITS_BAR_MAX = 500000;

const LANG_FULL_LABEL = { en: 'English', ru: 'Русский' };

function initials(email) {
  if (!email) return 'U';
  return email.trim()[0].toUpperCase();
}

function ProfileIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function AffiliateIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="10.6" x2="15.4" y2="6.4" />
      <line x1="8.6" y1="13.4" x2="15.4" y2="17.6" />
    </svg>
  );
}

function CommunityIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M4.75 4.5C4.61193 4.5 4.5 4.61193 4.5 4.75L4.5 19.25C4.5 19.3881 4.61193 19.5 4.75 19.5H11.25C11.6642 19.5 12 19.8358 12 20.25C12 20.6642 11.6642 21 11.25 21H4.75C3.7835 21 3 20.2165 3 19.25L3 4.75C3 3.7835 3.7835 3 4.75 3L11.25 3C11.6642 3 12 3.33579 12 3.75C12 4.16421 11.6642 4.5 11.25 4.5L4.75 4.5ZM15.2197 6.96967C15.5126 6.67678 15.9874 6.67678 16.2803 6.96967L20.7803 11.4697C21.0732 11.7626 21.0732 12.2374 20.7803 12.5303L16.2803 17.0303C15.9874 17.3232 15.5126 17.3232 15.2197 17.0303C14.9268 16.7374 14.9268 16.2626 15.2197 15.9697L18.4393 12.75L9 12.75C8.58579 12.75 8.25 12.4142 8.25 12C8.25 11.5858 8.58579 11.25 9 11.25L18.4393 11.25L15.2197 8.03033C14.9268 7.73744 14.9268 7.26256 15.2197 6.96967Z" fill="currentColor" />
    </svg>
  );
}

export default function ProfileMenu({ email, balance, plan = 'Free Plan', onSignOut, onUpgrade }) {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();
  const lang = useLang();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setLangOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  const usd = balance != null ? balance : null;
  const credits = usd != null ? Math.round(usd * CREDITS_PER_USD) : null;
  const username = email ? email.split('@')[0] : 'Guest';
  const creditsPct = credits != null ? Math.min(100, Math.round((credits / CREDITS_BAR_MAX) * 100)) : 0;

  const navigate = (path) => {
    setOpen(false);
    setLangOpen(false);
    router.push(path);
  };

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
            <div className="flex flex-col gap-1.5 rounded-2xl bg-white/[0.04] px-3 pt-2.5 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white">Credits</span>
                <span className="text-xs font-medium text-white/50">
                  {credits != null ? `${credits.toLocaleString()} left` : '—'}
                </span>
              </div>

              {/* Decorative progress bar */}
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#22d3ee] to-[#a855f7] transition-all"
                  style={{ width: `${creditsPct}%` }}
                />
              </div>

              <button
                type="button"
                onClick={() => { setOpen(false); onUpgrade?.(); }}
                className="mt-1 flex h-8 w-full items-center justify-between rounded-full px-1 text-xs font-medium text-white transition-colors hover:bg-white/5"
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

          <div className="h-px w-full bg-white/10" />

          {/* Links */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex h-8 w-full items-center gap-1.5 rounded-full pl-1 pr-2.5 text-left text-xs font-medium text-white transition-colors hover:bg-white/5"
            >
              <span className="flex size-6 items-center justify-center text-white/40">
                <ProfileIcon />
              </span>
              View profile
            </button>

            <button
              type="button"
              onClick={() => navigate('/account')}
              className="flex h-8 w-full items-center gap-1.5 rounded-full pl-1 pr-2.5 text-left text-xs font-medium text-white transition-colors hover:bg-white/5"
            >
              <span className="flex size-6 items-center justify-center text-white/40">
                <GearIcon />
              </span>
              Manage Account
            </button>

            <button
              type="button"
              onClick={() => navigate('/affiliate')}
              className="flex h-8 w-full items-center gap-1.5 rounded-full pl-1 pr-2.5 text-left text-xs font-medium text-white transition-colors hover:bg-white/5"
            >
              <span className="flex size-6 items-center justify-center text-white/40">
                <AffiliateIcon />
              </span>
              <span className="flex-1">Affiliate program</span>
              <span className="flex h-5 items-center rounded-full bg-[#22d3ee] px-2 text-[9px] font-bold text-black">
                New
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/community')}
              className="flex h-8 w-full items-center gap-1.5 rounded-full pl-1 pr-2.5 text-left text-xs font-medium text-white transition-colors hover:bg-white/5"
            >
              <span className="flex size-6 items-center justify-center text-white/40">
                <CommunityIcon />
              </span>
              Join Community
            </button>

            {/* Language */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLangOpen((o) => !o); }}
                className="flex h-8 w-full items-center gap-1.5 rounded-full pl-1 pr-2.5 text-left text-xs font-medium text-white transition-colors hover:bg-white/5"
              >
                <span className="flex size-6 items-center justify-center text-white/40">
                  <GlobeIcon />
                </span>
                <span className="flex-1">Language</span>
                <span className="text-white/40">{LANG_FULL_LABEL[lang] || LANG_LABEL[lang]}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/30">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {langOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-[#161618] border border-white/10 shadow-xl p-1 z-10"
                >
                  {LANG_CYCLE.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => { setAppLang(code); setLangOpen(false); }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        lang === code ? 'text-[#22d3ee] bg-[#22d3ee]/10' : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      {LANG_FULL_LABEL[code] || LANG_LABEL[code]}
                      {lang === code && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
                <SignOutIcon />
              </span>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
