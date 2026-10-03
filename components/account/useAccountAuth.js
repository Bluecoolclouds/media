'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { getUserBalance } from 'studio/src/muapi';
import { AUTH_KEY, STORAGE_KEY, CREDITS_PER_USD } from './useLocalAuth';
// Note: sign-out only clears the browser copy; the server-stored key stays
// with the account and is available again on next sign-in.
import { resolveClientMuapiKey } from '@/lib/muapiKeyClient';

/**
 * Account/affiliate auth state. Identity (email, name, role) comes ONLY from
 * the NextAuth session. The MuAPI key is stored server-side for signed-in
 * users (lib/muapiKeyClient.js); localStorage is only an anonymous fallback.
 * Must be rendered under a next-auth <SessionProvider>.
 */
export function useAccountAuth() {
  const { data: session, status } = useSession();
  const [hasMounted, setHasMounted] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState(null);
  const [balance, setBalance] = useState(null);

  const fetchBalance = useCallback(async (key) => {
    if (!key) return;
    try {
      const data = await getUserBalance(key);
      setBalance(data.balance);
    } catch (err) {
      console.error('Balance fetch failed:', err);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    let cancelled = false;
    // Signed in: key comes from the server (apiKey is the session placeholder,
    // the proxies substitute the real key). Signed out: localStorage fallback.
    resolveClientMuapiKey().then(({ key, masked }) => {
      if (cancelled) return;
      setApiKey(key);
      setMaskedKey(masked);
      setHasMounted(true);
      if (key) fetchBalance(key);
    });
    return () => { cancelled = true; };
  }, [status, fetchBalance]);

  const user = session?.user || null;
  const email = user?.email || '';
  const name = user?.name || '';
  const usd = balance != null ? balance : null;
  const credits = usd != null ? Math.round(usd * CREDITS_PER_USD) : null;
  const username = email ? email.split('@')[0] : 'Guest';

  return {
    status,
    isAuthed: status === 'authenticated',
    // Ready once the session and the MuAPI key source are both resolved.
    hasMounted: hasMounted && status !== 'loading',
    user,
    email,
    name,
    // Opaque value to pass as x-api-key; for signed-in users it is the session
    // placeholder, not the real key. Display `maskedKey` instead of this.
    apiKey,
    setApiKey,
    maskedKey,
    setMaskedKey,
    usd,
    credits,
    username,
    fetchBalance,
  };
}

/** Remove every legacy client-side auth artifact (identity blob, MuAPI key, cookie). */
export function clearLocalAuth() {
  try {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
  document.cookie = 'muapi_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/** End the NextAuth session and wipe local auth keys. */
export async function signOutAndClear(callbackUrl = '/') {
  clearLocalAuth();
  await signOut({ callbackUrl });
}

export function loginUrl(callbackUrl) {
  return `/login?callbackUrl=${encodeURIComponent(callbackUrl || '/')}`;
}
