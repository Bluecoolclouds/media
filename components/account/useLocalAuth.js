'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserBalance } from 'studio/src/muapi';

export const AUTH_KEY = 'apinet_auth'; // { email, name, key } persisted after login
export const STORAGE_KEY = 'muapi_key';
export const CREDITS_PER_USD = 500000;

/**
 * Reads the localStorage-based auth/session state used across the main site
 * (email, name, API key, balance). This mirrors what StandaloneShell does on
 * mount, so every /account/* tab shows consistent data without re-deriving it.
 */
export function useLocalAuth() {
  const [hasMounted, setHasMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [balance, setBalance] = useState(null);
  const [signedInAt, setSignedInAt] = useState(null);

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
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.email) setEmail(data.email);
        if (data?.name) setName(data.name);
        if (data?.signedInAt) setSignedInAt(data.signedInAt);
      }
    } catch (_) {}

    const stored = localStorage.getItem(STORAGE_KEY) || '';
    setApiKey(stored);
    if (stored) fetchBalance(stored);
  }, [fetchBalance]);

  const usd = balance != null ? balance : null;
  const credits = usd != null ? Math.round(usd * CREDITS_PER_USD) : null;
  const username = email ? email.split('@')[0] : 'Guest';

  return { hasMounted, email, setEmail, name, setName, apiKey, setApiKey, usd, credits, username, signedInAt, fetchBalance };
}
