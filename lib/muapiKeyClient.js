'use client';

// Browser-side MuAPI key handling.
//
// Signed-in users: the key lives encrypted on the server (/api/account/muapi-key).
// The browser never holds it; it uses SESSION_KEY_SENTINEL as its "apiKey",
// and the /api proxies swap that for the real key from the session.
// Anonymous users: the key stays in localStorage + the muapi_key cookie (fallback).

import { SESSION_KEY_SENTINEL, maskApiKey } from './muapiKeyShared';

export { SESSION_KEY_SENTINEL };

export const LOCAL_KEY = 'muapi_key';
const ENDPOINT = '/api/account/muapi-key';

function readLocalKey() {
  try {
    return localStorage.getItem(LOCAL_KEY) || '';
  } catch (_) {
    return '';
  }
}

function writeLocalKey(key) {
  try {
    localStorage.setItem(LOCAL_KEY, key);
  } catch (_) {}
  // Unencoded on purpose: app/agents/* clients read document.cookie raw.
  document.cookie = `muapi_key=${key}; path=/; max-age=31536000; SameSite=Lax`;
}

/** Drop the browser copy. Also required for signed-in users: the proxies
 *  prefer the cookie over the session, so a stale cookie would win. */
export function clearLocalMuapiKey() {
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch (_) {}
  document.cookie = 'muapi_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/** { authed, hasKey, masked } — authed=false when there is no session. */
export async function getServerKeyStatus() {
  try {
    const res = await fetch(ENDPOINT, { cache: 'no-store', credentials: 'same-origin' });
    if (res.status === 401) return { authed: false, hasKey: false, masked: null };
    if (!res.ok) return { authed: true, hasKey: false, masked: null, error: true };
    const data = await res.json();
    return { authed: true, hasKey: Boolean(data.hasKey), masked: data.masked || null };
  } catch (_) {
    return { authed: false, hasKey: false, masked: null, error: true };
  }
}

/**
 * Work out which key value the client should use.
 * Returns { key, source: 'server' | 'local' | 'env' | 'none', masked }.
 */
export async function resolveClientMuapiKey({ envKey = '' } = {}) {
  const local = readLocalKey();
  const status = await getServerKeyStatus();

  if (status.authed && status.hasKey) {
    clearLocalMuapiKey();
    return { key: SESSION_KEY_SENTINEL, source: 'server', masked: status.masked };
  }
  // Deliberately NO automatic upload of a leftover local key into the signed-in
  // account: on a shared browser it may belong to someone else. The user moves
  // it to their account by re-saving it (saveMuapiKey) on /account.

  if (local && local !== SESSION_KEY_SENTINEL) return { key: local, source: 'local', masked: maskApiKey(local) };
  if (envKey) return { key: envKey, source: 'env', masked: maskApiKey(envKey) };
  return { key: '', source: 'none', masked: null };
}

/**
 * Persist a key: on the server when signed in, otherwise in localStorage.
 * Returns { ok, key, source, masked, error }.
 */
export async function saveMuapiKey(rawKey) {
  const key = (rawKey || '').trim();
  if (!key) return { ok: false, error: 'Enter an API key' };

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ key }),
    });
  } catch (_) {
    res = null;
  }

  if (res && res.ok) {
    const data = await res.json().catch(() => ({}));
    clearLocalMuapiKey();
    return { ok: true, key: SESSION_KEY_SENTINEL, source: 'server', masked: data.masked || maskApiKey(key) };
  }

  // Not signed in, network failure, or server storage not configured:
  // keep the old browser-only behavior so the studio still works.
  if (!res || res.status === 401 || res.status === 503) {
    writeLocalKey(key);
    return { ok: true, key, source: 'local', masked: maskApiKey(key) };
  }

  const data = await res.json().catch(() => ({}));
  return { ok: false, error: data.error || 'Failed to save API key' };
}

/** Remove the key everywhere this browser can reach (server + local). */
export async function deleteMuapiKey() {
  clearLocalMuapiKey();
  try {
    await fetch(ENDPOINT, { method: 'DELETE', credentials: 'same-origin' });
  } catch (_) {}
}
