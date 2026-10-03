'use client';

import { useRouter } from 'next/navigation';
import { LANG_CYCLE, LANG_LABEL } from 'studio/src/i18n/core';
import ProfileMenu from './ProfileMenu';

/**
 * Shared top navigation used across /studio and /account (and anywhere else
 * that needs the same identity: logo, balance, Pricing link, language toggle,
 * ProfileMenu/Sign-in). `centerContent` lets /studio inject its pill tab-nav
 * while other pages (e.g. /account) just leave the center empty.
 */
export default function SiteHeader({
  lang,
  onLangChange,
  balance,
  isAuthed,
  userEmail,
  onSignIn,
  onSignOut,
  centerContent,
}) {
  const router = useRouter();

  return (
    <header className="flex-shrink-0 h-[52px] border-b border-white/[0.06] flex items-center gap-3 px-4 sm:px-6 bg-black/40 backdrop-blur-md z-40">
      {/* Left: Logo */}
      <button
        type="button"
        onClick={() => router.push('/studio')}
        className="flex-shrink-0 flex items-center gap-2"
      >
        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-sm font-bold tracking-tight hidden sm:block">apinet.cloud</span>
      </button>

      {/* Center: page-specific content (studio tabs, or nothing) */}
      <div className="flex-1 min-w-0 h-full flex items-center">{centerContent}</div>

      {/* Right: Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        <div className="hidden sm:flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-full border border-white/5 mr-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-white/90">
            ${balance !== null && balance !== undefined ? `${balance}` : '---'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => router.push('/pricing')}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          Pricing
        </button>

        <span className="hidden sm:block h-4 w-px bg-white/10 mx-1" aria-hidden="true" />

        <button
          type="button"
          onClick={onLangChange}
          title="Switch language"
          className="flex items-center justify-center size-8 rounded-lg text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          {LANG_LABEL[LANG_CYCLE[(LANG_CYCLE.indexOf(lang) + 1) % LANG_CYCLE.length]]}
        </button>

        <span className="h-4 w-px bg-white/10 mx-1" aria-hidden="true" />

        {isAuthed ? (
          <ProfileMenu
            email={userEmail}
            balance={balance}
            onSignOut={onSignOut}
            onUpgrade={() => router.push('/pricing')}
          />
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            className="flex items-center px-3.5 py-1.5 rounded-lg bg-[#22d3ee] text-black text-[13px] font-bold hover:bg-[#e5ff33] transition-colors"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
