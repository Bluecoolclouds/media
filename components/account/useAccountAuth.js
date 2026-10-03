'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { getUserBalance } from 'studio/src/muapi';
import { AUTH_KEY, STORAGE_KEY, CREDITS_PER_USD } from './useLocalAuth';

/**
 * Account/affiliate auth state. Identity (email, name, role) comes ONLY from
 * the NextAuth session. localStorage is used solely for the MuAPI key
 * (STORAGE_KEY) and the balance it unlocks — never to decide who the user is.
 * Must be rendered under a next-auth <SessionProvider>.
 */
export function useAccountAuth() {
  const { data: session, status } = useSession();
  const [hasMounted, setHasMounted] = useState(false);
  const [apiKey, setApiKey] = useState('');
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
    setHasMounted(true);
    let stored = '';
    try {
      stored = localStorage.getItem(STORAGE_KEY) || '';
    } catch (_) {}
    setApiKey(stored);
    if (stored) fetchBalance(stored);
  }, [fetchBalance]);

  const user = session?.user || null;
  const email = user?.email || '';
  const name = user?.name || '';
  const usd = balance != null ? balance : null;
  const credits = usd != null ? Math.round(usd * CREDITS_PER_USD) : null;
  const username = email ? email.split('@')[0] : 'Guest';

  return {
    status,
    isAuthed: status === 'authenticated',
    // Ready once localStorage was read and the session is resolved.
    hasMounted: hasMounted && status !== 'loading',
    user,
    email,
    name,
    apiKey,
    setApiKey,
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
