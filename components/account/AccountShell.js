'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLang } from 'studio/src/i18n/useLang';
import { setLang as setAppLang, LANG_CYCLE } from 'studio/src/i18n/core';
import SiteHeader from '@/components/SiteHeader';
import { useAccountAuth, signOutAndClear, loginUrl } from '@/components/account/useAccountAuth';

function UserIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}

function SessionsIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="8" width="18" height="13" rx="1" />
      <path d="M12 8v13M3 12h18" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}

function SubscriptionIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function UsageIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <path d="M7 15l4-5 3 3 5-6" />
    </svg>
  );
}

function PromocodeIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.17L3.83 9.59A2 2 0 0 0 3.17 11l9.58 9.59a2 2 0 0 0 2.83 0l5.17-5.17a2 2 0 0 0-.16-2.01z" />
      <circle cx="8" cy="8" r="1.5" />
    </svg>
  );
}

const NAV = [
  { href: '/account', label: 'Personal profile', icon: UserIcon },
  { href: '/account/sessions', label: 'All sessions', icon: SessionsIcon },
  { href: '/account/gifts', label: 'Gifts', icon: GiftIcon },
  { href: '/account/subscription', label: 'Subscription', icon: SubscriptionIcon },
  { href: '/account/usage', label: 'Usage', icon: UsageIcon },
  // Disabled: there is no /api/promocode/redeem endpoint yet.
  { href: '/account/promocode', label: 'Promocode', icon: PromocodeIcon, disabled: true },
];

export default function AccountShell({ children, workspaceName }) {
  const router = useRouter();
  const pathname = usePathname();
  const lang = useLang();
  const { email, usd, isAuthed } = useAccountAuth();

  const handleLangChange = () => {
    const next = LANG_CYCLE[(LANG_CYCLE.indexOf(lang) + 1) % LANG_CYCLE.length];
    setAppLang(next);
  };

  const handleSignOut = () => signOutAndClear('/');

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Top nav — identical to /studio: logo, balance, Pricing, language, ProfileMenu */}
      <SiteHeader
        lang={lang}
        onLangChange={handleLangChange}
        balance={usd}
        isAuthed={isAuthed}
        userEmail={email}
        onSignIn={() => router.push(loginUrl(pathname))}
        onSignOut={handleSignOut}
        centerContent={
          <button
            type="button"
            onClick={() => router.push('/studio')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to studio
          </button>
        }
      />

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8 md:py-10">
        {/* Sidebar */}
        <aside className="hidden md:flex w-56 shrink-0 flex-col">
          {workspaceName && (
            <p className="mb-3 px-2 text-[11px] font-medium text-white/35 truncate">{workspaceName}</p>
          )}
          <nav className="flex flex-col gap-0.5">
            {NAV.map(({ href, label, icon: Icon, disabled }) => {
              const active = href === '/account' ? pathname === '/account' : pathname.startsWith(href);
              return (
                <button
                  key={href}
                  type="button"
                  disabled={disabled}
                  title={disabled ? 'Coming soon' : undefined}
                  onClick={() => router.push(href)}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors ${
                    disabled
                      ? 'text-white/25 cursor-not-allowed'
                      : active ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon />
                  {label}
                  {disabled && <span className="ml-auto text-[10px] font-medium text-white/30">Soon</span>}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-white/55 hover:bg-white/5 hover:text-white transition-colors"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to studio
            </button>
          </div>
        </aside>

        {/* Mobile nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex overflow-x-auto gap-1 border-t border-white/10 bg-[#0a0a0a] px-2 py-2">
          {NAV.map(({ href, label, icon: Icon, disabled }) => {
            const active = href === '/account' ? pathname === '/account' : pathname.startsWith(href);
            return (
              <button
                key={href}
                type="button"
                disabled={disabled}
                title={disabled ? 'Coming soon' : undefined}
                onClick={() => router.push(href)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  disabled ? 'text-white/25 cursor-not-allowed' : active ? 'bg-white/10 text-white' : 'text-white/50'
                }`}
              >
                <Icon />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>
      </div>
    </div>
  );
}
