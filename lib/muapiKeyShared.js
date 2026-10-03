// Shared by the browser and the server — must stay dependency-free.

/**
 * Placeholder the client sends as `x-api-key` when the real MuAPI key lives
 * on the server. The /api proxies treat it as "no key in the request" and
 * substitute the signed-in user's decrypted key. It is not a credential: it
 * only ever resolves to the key of whoever owns the session cookie.
 */
export const SESSION_KEY_SENTINEL = '__session__';

/** `****abcd`-style mask; never reveals more than the last 4 characters. */
export function maskApiKey(key) {
  if (!key || typeof key !== 'string') return null;
  const last4 = key.length > 8 ? key.slice(-4) : '';
  return `****${last4}`;
}
