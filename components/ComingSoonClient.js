'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from 'studio/src/i18n/useLang';
import { setLang as setAppLang, LANG_CYCLE } from 'studio/src/i18n/core';
import SiteHeader from './SiteHeader';
import AuthModal from './AuthModal';
import { useLocalAuth, AUTH_KEY, STORAGE_KEY } from './account/useLocalAuth';
import { saveMuapiKey } from '../lib/muapiKeyClient';

export default function ComingSoonClient({ title, description, emoji }) {
  const router = useRouter();
  const lang = useLang();
  const { email, usd, fetchBalance } = useLocalAuth();
  const [showAuth, setShowAuth] = useState(false);
  const isAuthed = Boolean(email);

  const handleLangChange = () => {
    const next = LANG_CYCLE[(LANG_CYCLE.indexOf(lang) + 1) % LANG_CYCLE.length];
    setAppLang(next);
  };

  const handleAuthSuccess = async ({ key, email: newEmail }) => {
    setShowAuth(false);
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      const prev = raw ? JSON.parse(raw) : {};
      localStorage.setItem(AUTH_KEY, JSON.stringify({ ...prev, email: newEmail, signedInAt: new Date().toISOString() }));
    } catch (_) {}
    const effectiveKey = key && key.trim();
    if (effectiveKey) {
      // Server when signed in, localStorage otherwise.
      await saveMuapiKey(effectiveKey);
    }
    window.location.reload();
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    document.cookie = 'muapi_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SiteHeader
        lang={lang}
        onLangChange={handleLangChange}
        balance={usd}
        isAuthed={isAuthed}
        userEmail={email}
        onSignIn={() => setShowAuth(true)}
        onSignOut={handleSignOut}
      />

      {showAuth && (
        <AuthModal onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />
      )}

      <div className="px-4 py-10 md:py-14 flex items-center justify-center">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-3xl">
            {emoji}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm text-white/50">{description}</p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#22d3ee]/30 bg-[#22d3ee]/10 px-4 py-1.5 text-xs font-semibold text-[#22d3ee]">
            Coming soon
          </div>
        </div>
      </div>
    </div>
  );
}
